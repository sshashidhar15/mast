/*global describe, it, xdescribe, after, before*/
var path = require('path');
var http = require('http');
var assert = require('assert')
var fetch = require('node-fetch')
var md5 = require('../utils/md5')
var config = require('../config')
var bundler = require('../routes/bundler');
var generateRoutes = require('../utils/generateRoutes');
var init = require('../app');
var registration = require('../models/registration')
var redis = require('../redis')
var redis_pub = require('../redis_pub')
var redis_sub = require('../redis_sub')

var langs = config.locales.map(locale => locale.code);
var routes = generateRoutes(config.routes);
var port = config.port
var appRoot = 'http://localhost:' + port;
var root

var server;
var max_timeout = 1e7
const TEST_PASSED = undefined
const REDIRECTS_MANUAL = 'manual'
const REDIRECTS_FOLLOW = 'follow'
const regulators = process.env.IS_CN_HOST === 'true' ? config.regulators_cn : config.regulators

var check_status_code = (urls, expect_code, redirect) =>
    urls.forEach(url =>
        it(url + ' should return ' + expect_code, () => {
            const opts = {
                method: 'GET'
            }
            if (redirect) opts['redirect'] = redirect
            return fetch(
                url,
                opts
            )
                .then(res => {
                    assert.equal(res.status, expect_code)
                })
        })
    );

describe('Check request statuses', () => {
  before(function(done) {
    this.timeout(max_timeout)
    init()
    .then(app => {
      app.set('port', port);
      bundler.make_all_bundles(error => {
        if (error) return done(error)
        server = app.listen(port);
        server.on('error', error  => done(error));
        server.on('listening', () => done());
      });
    })
  })
  regulators.forEach(REGULATOR => describe(REGULATOR, () => {root = appRoot + '/' + config.regulators_prefixes[REGULATOR];
    if (REGULATOR != 'cysec')
    xdescribe('force redirect to regulator by country-code', () => {
        it(root + ' with country_code: in -> should redirect to: ' + root.replace(config.regulators_prefixes[REGULATOR], config.regulators_prefixes.fsa), () =>
            fetch(
                root,
                {
                    headers: {
                        country_code: 'in'
                    }
                }
            )
                .then(response => {
                    assert.ok(response.ok)
                    assert.ok(response.url.includes('/' + config.regulators_prefixes.fsa))
                })
        )
        it(root + ' with country_code: ru -> should redirect to: ' + root.replace(config.regulators_prefixes[REGULATOR], config.regulators_prefixes.fsa), () =>
            fetch(
                root,
                {
                    headers: {
                        country_code: 'ru'
                    }
                }
            )
                .then(response => {
                    assert.ok(response.ok)
                    assert.ok(response.url.includes('/' + config.regulators_prefixes.fsa))
                })
        )
        it(root + ' with country_code: au -> should redirect to: ' + root.replace(config.regulators_prefixes[REGULATOR], config.regulators_prefixes.asic), () =>
            fetch(
                root,
                {
                    headers: {
                        country_code: 'au'
                    }
                }
            )
                .then(response => {
                    assert.ok(response.ok)
                    assert.ok(response.url.includes('/' + config.regulators_prefixes.asic))
                })
        )
        it('route only should be redirected to /regulator/lang/route', () =>
            fetch(
                appRoot + '/advanced-trading-tools-index/',
                {
                    headers: {
                        country_code: 'au'
                    },
                    redirect: REDIRECTS_FOLLOW
                }
            )
            .then(response => {
                assert.ok(response.ok)
                assert.ok(response.url.includes('/au/en/forex-trading-tools/mt4-advanced-tools'))
            })
        )
    })


  describe('should return 200 on health check', () => {
    var urls = [[appRoot, 'health'].join('/')];
    check_status_code(urls, 200)
  })

  describe('should return 200 on commit check', () => {
    var urls = [[appRoot, 'commit'].join('/')];
    check_status_code(urls, 200)
  })

  describe('should redirect all seo pages with 302', () => {
    var urls = Object.keys(config.seo_redirects).reduce((urls, path) => urls.concat(langs.map(lang => [root, lang, path].join('/'))), []);
    check_status_code(urls, 302, REDIRECTS_MANUAL)
  })

   describe('custom routes', () => {
        it('should redirect from  ES custom route to IT custom route', () =>
            fetch(
                [root, 'es', 'informacion/acerca-de-icmarkets'].join('/'),
                {
                    headers: {
                        Cookie: 'user_want_language=it'
                    },
                    redirect: REDIRECTS_FOLLOW
                }
            )
                .then(res =>
                    assert.equal(
                        res.url,
                        [root, 'it', 'informazioni/about-icmarkets'].join('/')
                    )
                )
        )
        it('should redirect from ES to RU if in accept-language: ru,en;q=0.9,uk;q=0.8,it;q=0.7,de;q=0.6', () =>
            fetch(
                [root, 'es', 'informacion/acerca-de-icmarkets'].join('/'),
                {
                    headers: {
                        'accept-language': 'ru,en;q=0.9,uk;q=0.8,it;q=0.7,de;q=0.6'
                    },
                    redirect: REDIRECTS_FOLLOW
                }
            )
                .then(res =>
                    assert.equal(
                        res.url,
                        [root, 'ru', 'company/about-icmarkets'].join('/')
                    )
                )
        )
        it('WEB-1240 Google Ads add "eu" to end of url so "/sc/en/eu?camp=333" does not work. so we redirect to "/eu/en?camp=333"', done =>
            http.get([root, 'en', 'eu?camp=2222222'].join('/'), response =>
                response
                    .on('data', () => null)
                    .on('end', () =>
                        done(
                            response.statusCode === 302
                                ? response.url === [root, 'eu'].join('/')
                                    ? TEST_PASSED
                                    : response.url
                                : response.statusCode
                        )
                    )
            )
        )
    })

  describe('should return 404 on invalid path', () => {
    var urls = langs.map(lang => [root, lang, 404].join('/'));
    check_status_code(urls, 404, REDIRECTS_FOLLOW)
  })

  describe('should return 200 on content pages', () => {
    const test_200_routes = JSON.parse(JSON.stringify(routes))
    langs.forEach(lang => {
        delete test_200_routes[lang]['test-only-invalid-template'];
        delete test_200_routes[lang]['test-only-not-exist-translation-key'];
        delete test_200_routes[lang]['translator-welcome'];

        //test professional-clients page disabled because eu redirect to default sc but there is not allowed such page
        /*if (REGULATOR !== 'cysec')*/ delete test_200_routes[lang]['trading-accounts-professional-clients'];

        delete test_200_routes[lang]['forex-trading-tools-api-trading'];
        delete test_200_routes[lang]['company-monthly-volume-report'];
        delete test_200_routes[lang]['help-resources-fsa-migration-help'];
        delete test_200_routes[lang]['company-entities'];
    });
    var urls = Object.keys(test_200_routes).reduce(
        (urls, lang) =>
            urls.concat(
                Object.values(test_200_routes[lang])
                    .filter(path => REGULATOR !== 'cysec' || config.cysec_pages.includes(path))
                    .map(path => [root, lang, path].join('/'))
            ),
        []
    )
    check_status_code(urls, 200, REDIRECTS_FOLLOW)
  })

  describe('Check cookies', () => {
    it('response should have lang cookie header', done => {
      http.get([root, langs[0]].join('/') + '/?set_lang=' + langs[0], response => {
        assert.ok(
          response.headers['set-cookie'][0]
            .includes('user_want_language=' + langs[0])
        )
        done()
      })
    })

    it('response should log CN lang conflict', done => {
      fetch([root].join('/'), {
        headers: {
          'Cookie': 'user_want_language=ar',
          country_code: 'cn'
        }
      }).then(response => {
        assert.ok(response.ok)
        done()
      })
    })

    it('response should log CN lang invalid', done => {
      fetch([root].join('/'), {
        headers: {
          'Cookie': 'user_want_language=uk',
          country_code: 'cn'
        }
      }).then(response => {
        assert.ok(response.ok)
        done()
      })
    })

    it('response should log CN lang missing', done => {
      fetch([root].join('/'), {
        headers: {
          country_code: 'cn'
        }
      }).then(response => {
        assert.ok(response.ok)
        done()
      })
    })

    it('seo-redirect with query', done => {
      http.get([root, langs[0], Object.keys(config.seo_redirects)[0]].join('/') + '/?set_lang=' + langs[1], response =>
          response
              .on('data', () => null)
              .on('end', () => done(response.statusCode === 302 ? undefined : response.statusCode))
      )
    })

    it('response should have camp', done => {
      let campId = 1231231231245
      http.get([root, langs[0]].join('/') + '/?camp=' + campId, response => {

        assert.ok(
          response.headers['set-cookie'][0]
            .includes('camp=' + campId)
        )
        assert.ok(
          response.headers['set-cookie'][1]
            .includes('camp_click=' + campId)
        )
        done()
      })
    })

    it('response should have invintation', done => {
      let invId = 1231231231245
      http.get([root, langs[0]].join('/') + '/?invitation=' + invId, response => {
        assert.ok(
          response.headers['set-cookie'][0]
            .includes('invitation_guid=' + invId)
        )
        done()
      })
    })
  })

  describe('seo-redirect handle incorrect lang', () =>
    it('not unexisted lang should be redirected with lang from cookies', done => {
        var invalid_lang = 'zz';

        http.get([root, invalid_lang, Object.keys(config.seo_redirects)[0]].join('/') + '/?set_lang=' + langs[1], response =>
            response
                .on('data', () => null)
                .on('end', () => done(response.statusCode === 302 ? undefined : response.statusCode))
        )
    })
  )

  xdescribe('Cache static files', () =>
      it('*.js *.css should be cached at user browser by adding postfix "?md5-hash" to end of filename', done => {
          var content = '';
          http.get([root, langs[0]].join('/'), response =>
              response
                  .on('data', _ => content += _)
                  .on('end', () => {
                      var from = content.indexOf('style.css?') + 10;
                      var to = from + 32;
                      assert.equal(
                          content.substring(from , to),
                          md5(path.join(__dirname, '..', 'public', 'css', 'style.css'))
                      );
                      done();
                  })
          ).on('error', done);
      })
  )

  xdescribe('Monitoring should be working under setted ICM_ENVIRONMENT', () => {
      var monitoring_url = config.monitoring_url;

      before(() => process.env.ICM_ENVIRONMENT = true)

      describe('Request to invalid monitoring URL should be logged', () => {
          var monitoring_url_invalid = 'http://invalid^http^url';
          var logger_error;

          before(() => {
              config.monitoring_url = monitoring_url_invalid;
              logger_error = console.error;
          })

          it('send HTTP GET request to invalid URL should fail', function (done) {
              this.timeout(30000)
              console.error = message => done(message === 'WRITE POINT ERROR' ? undefined : message)
              http.get([root, langs[0]].join('/'))
          })

          after(() => {
              config.monitoring_url = monitoring_url;
              console.error = logger_error;
          })
      })

      describe('Monitoring service have to response statusCode', () => {
          var monitoring_url = config.monitoring_url;
          var logger_error;

          before(() => logger_error = console.error)

          it('Non 2xx status codes have to be logged to kibana', done => {
              config.monitoring_url = 'http://localhost:8081/invalid';
              var server = http.createServer((req, res) => {
                  res.statusCode = 500;
                  res.end();
              });
              console.error = message =>
                  server.close(() =>
                      done(message.indexOf('Monitoring service return ') === -1 ? message : undefined));
              server.listen(8081, '127.0.0.1', () => http.get([root, langs[0]].join('/')))
          })

          it('200 status code for valid requests to monitoring', done => {
              config.monitoring_url = 'http://localhost:8081/valid';
              var server = http.createServer((req, res) => {
                  res.statusCode = 200;
                  res.write('ok');
                  res.end();
                  server.close(() => done())
              });
              server.listen(8081, '127.0.0.1', () => http.get([root, langs[0]].join('/')))
          })

          after(() => {
              config.monitoring_url = monitoring_url;
              console.error = logger_error;
          })
      })

      after(() => process.env.ICM_ENVIRONMENT = false)
  })

  xdescribe('Handle 500 error code', () => {
      it('route /internal_error_test should return 500', done =>
          http.get([root, 'internal_error_test'].join('/'), response =>
              response
                  .on('data', () => null)
                  .on('end', () => done(response.statusCode === 500 ? undefined : response.statusCode))
          ).on('error', done)
      )

      it('Invalid ejs template by route /en/test-only-invalid-template should return 500', done =>
          http.get([root, 'en', 'test-only-invalid-template'].join('/'), response =>
              response
                  .on('data', () => null)
                  .on('end', () => done(response.statusCode === 500 ? undefined : response.statusCode))
          ).on('error', done)
      )

      it('Not exist translation key should return 500', done =>
          http.get([root, 'en', 'test-only-not-exist-translation-key'].join('/'), response =>
              response
                  .on('data', () => null)
                  .on('end', () => done(response.statusCode === 500 ? undefined : response.statusCode))
          ).on('error', done)
      )
  })

}))//end loop by regulators

  after(function (done) {
    this.timeout(max_timeout)
    server.close()
    registration.destroy()
    Promise.all([redis, redis_sub, redis_pub].map(get_client => new Promise((y, n) => get_client((err, client) => client.quit(err => err ? n(err) : y())))))
      .then(() => done())
      .catch(done)
  })

})

//xdescribe('WEB-927 change button text in partnerships overview page', () => {
//  it('text should be same for all languages at big green button for pages: https://www.icmarkets.com/en/partnerships/partnerships-overview & https://www.icmarkets.com/en/partnerships/introducing-broker', function (done) {
//    this.timeout(max_timeout)
//    getLocaleData(REGULATOR)
//      .then(translations =>
//        Object.keys(translations).forEach(lang => {
//          const
//            a = translations[lang]['pages']['partnerships']['index']['partnership_2'],
//            b = translations[lang]['pages']['partnerships']['introducing-broker']['introducing_broker_3']
//
//          assert.equal(a, b, new TypeError([a , '!==', b, '[diff in lang:', lang, ']'].join(' ')))
//        })
//      )
//      .then(() => done())
//      .catch(done)
//  })
//})

process.env.NODE_ENV === 'production' && describe('env COMMIT should be setted from git', () =>
    it('valid env COMMIT', () => assert.ok(/^[0-9a-z]{7}$/.test(process.env.COMMIT), process.env.COMMIT))
)
