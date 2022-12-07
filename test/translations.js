/*global describe, it, before, after*/
const fetch = require('node-fetch');
const assert = require('assert')
const msgpack = require('msgpack-lite')
const init = require('../app');
const redis = require('../redis')
const redis_pub = require('../redis_pub')
const redis_sub = require('../redis_sub')
const config = require('../config')
const {default_regulator, default_prefix, approve_pending_max_timeout} = config
const langs = config.locales.map(_ => _.code)
const regulators = process.env.IS_CN_HOST === 'true' ? config.regulators_cn : config.regulators
const toFlat = require('../utils/toFlat')
const words_count = require('../utils/words_count')
const port = config.port
const locale = 'en'
const note = 'This is note could store info about translator`s cred and deadlines'
const root = 'http://localhost:' + port + '/' + default_prefix + '/' + locale
const registration = require('../models/registration')
const translations = {
    title: 'Australian Foreign Exchange Broker ||'
}
const auth = {
    login: 'tester',
    password: 'ok123'
}
const max_timeout = 1e7
const REGULATOR = default_regulator

describe('Admin panel:', () => {
    var server
    var manager_token
    var translator_token

    before(function (done) {
        this.timeout(max_timeout)
        init()
            .then(app =>
                setTimeout(() => server = app.listen(port, () => done()), 1000)
            )
            .catch(done)
    })

    describe('Manager auth:', () => {
        var token

        it('Should load login form at /admin/auth.', function () {
            this.timeout(max_timeout)
            return fetch(
                root + '/admin/auth',
                {
                    method: 'GET'
                }
            )
                .then(_ => assert.equal(_.status, 200))
        })

        it('Should respond manager token in headers at success auth with login & password.', function () {
            this.timeout(max_timeout)
            return fetch(
                root + '/admin/auth',
                {
                    method: 'POST',
                    redirect: 'manual',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(auth)
                }
            )
                .then(res => {
                    assert.equal(res.status, 200)

                    var set_cookie        = res.headers.get('set-cookie')
                    var token_index_start = set_cookie.indexOf('manager_token=') + 'manager_token='.length
                    var token_index_end   = set_cookie.indexOf('; ', token_index_start)

                    token = set_cookie.substring(
                        token_index_start,
                        token_index_end,
                    )
                    assert.ok(token.length > 0)
                })
        })

        it('Should NOT respond manager token in headers at fail auth with wrong login or password.', function () {
            this.timeout(max_timeout)
            return fetch(
                root + '/admin/auth',
                {
                    method: 'POST',
                    redirect: 'manual',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        login: 'Hacker',
                        password: '22222222hacker'
                    })
                }
            )
                .then(_ =>
                    assert.equal(_.status, 401)
                )
        })

        it('Manager token should be valid.', function () {
            this.timeout(max_timeout)
            return fetch(
                config.auth_service_url + '/manager/token_validate',
                {
                    method: 'POST',
                    body: msgpack.encode({token})
                }
            )
                .then(_ => _.buffer())
                .then(_ => msgpack.decode(_))
                .then(_ => assert.ok(_))
        })

        after('For next tests lets keep manager token in variable "manager_token".', () => manager_token = token)
    })

    describe('Translations auth:', () => {
        var token

        it('Manager can create new translator token using note and manager token.', function () {
            this.timeout(max_timeout)
            return fetch(
                [root, 'admin', 'create_translator'].join('/'),
                {
                    method: 'POST',
                    headers: {
                        Cookie: 'manager_token=' + manager_token,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({note})
                }
            )
                .then(_ => _.text())
                .then(_ => token = JSON.parse(_).token)
        })

        it('New translator token from prev test should be valid token.', function () {
            this.timeout(max_timeout)
            return fetch(
                config.auth_service_url + '/translator/token_validate',
                {
                    method: 'POST',
                    body: msgpack.encode({token})
                }
            )
                .then(_ => _.buffer())
                .then(_ => msgpack.decode(_))
                .then(valid =>
                    assert.ok(valid)
                )
        })

        it('Auth request sets the cookie with redirect to main page.', function () {
            this.timeout(max_timeout)
            return fetch(
                [root, 'translator', 'login?translator_token=' + token].join('/'),
                {
                    redirect: 'manual'
                }
            )
                .then(_ => {
                    const cookies = _.headers.get('set-cookie')
                    assert.equal(_.status, 302)
                    assert.ok(cookies.includes('translator_token'))
                    assert.ok(cookies.includes('translator_should_load_his_translations_from_pendings'))
                    assert.ok(cookies.includes(token))
                })
        })

        it('Translator request with cookie "edit_translations" should allow editing on content in browser.', function () {
            this.timeout(max_timeout)
            return fetch(
                root,
                {
                    headers: {
                        Cookie: 'translator_token=' + token + '; edit_translations=true'
                    },
                    redirect: 'follow'
                }
            )
                .then(_ => _.text())
                .then(_ => assert.ok(/contenteditable/.test(_)))
        })

        it('Translator request without cookie "edit_translations" should allow editing content in browser.', function () {
            this.timeout(max_timeout)
            return fetch(
                root,
                {
                    headers: {
                        Cookie: 'translator_token=' + token
                    }
                }
            )
                .then(_ => _.text())
                .then(_ => assert.ok(/class="translator-editor"/.test(_), _))
        })

        after('For next test lets keep translator token in variable "translator_token".', () => translator_token = token)
    })

    describe('Translation administration:', () => {
        it('Translator have changes and press button "APPLY" should be created new pending with this token and locale', function () {
            this.timeout(max_timeout)
            return fetch(
                root + '/translation',
                {
                    method: 'POST',
                    headers: {
                        Cookie: 'translator_token=' + translator_token,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        map_lang_translations: {[locale]: translations}
                    })
                }
            )
                .then(() =>
                    fetch(
                        root + '/admin/pending',
                        {
                            method: 'POST',
                            headers: {
                                Cookie: 'manager_token=' + manager_token,
                            }
                        }
                    )
                        .then(_ => _.buffer())
                        .then(_ => msgpack.decode(new Uint8Array(_)))
                        .then(pendings => {
                            assert.notEqual(pendings[locale][translator_token], null)
                            const pending = msgpack.decode(pendings[locale][translator_token])
                            assert.strictEqual(pending.note, note)
                            assert.deepStrictEqual(pending.translations, translations)
                            pending.update_times.forEach(update_time =>
                                assert.strictEqual(typeof update_time, 'number')
                            )
                        })
                )
        })

        it('Request POST /translation should respond with 403 status code on unauthorised user', function () {
            this.timeout(max_timeout)
            return fetch([root, 'translation'].join('/'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    map_lang_translations: {[locale]: translations}
                })
            })
            .then(res => {
                assert.equal(res.status, 403)
            })
        })

        it('Request POST /translation should respond with 401 status code on manager token. Only translator token can apply translation. Better create translator token first via auth-service.', function () {
            this.timeout(max_timeout)
            return fetch(
                [root, 'translation'].join('/'),
                {
                    method: 'POST',
                    headers: {
                        Cookie: 'translator_token=' + manager_token,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        map_lang_translations: {[locale]: translations}
                    })
                }
            )
                .then(_ => assert.equal(_.status, 401))
        })

        it('Admin page should reflect pending translations.', function () {
            this.timeout(max_timeout)
            return fetch(
                [root, 'admin', 'pending'].join('/'),
                {
                    method: 'GET',
                    redirect: 'follow',
                    headers: {
                        Cookie: 'manager_token=' + manager_token
                    }
                }
            )
                .then(_ => {
                    assert.ok(_.ok)
                    assert.equal(_.status, 200)
                    return _.text()
                })
                .then(content =>
                    assert.ok(content.includes('</html>'))
                )
        })

        it('Admin page should NOT be visible without valid manager token.', function () {
            this.timeout(max_timeout)
            return fetch(
                [root, 'admin'].join('/'),
                {
                    method: 'GET',
                    redirect: 'manual',
                    headers: {
                        Cookie: 'manager_token=INVALID_TOKEN'
                    }
                }
            )
                .then(_ =>
                    assert.equal(_.status, 302)
                )
        })

        it('Invalid translator token in cookies should clear it in cookies.', function () {
            this.timeout(max_timeout)
            return fetch(
                root,
                {
                    method: 'GET',
                    headers: {
                        Cookie: 'translator_token=INVALID_TOKEN'
                    }
                }
            )
                .then(_ =>
                    assert.ok(_.headers.get('set-cookie').includes('translator_token=;'))
                )
        })

        it('We have an agreement between developers to have same translation keys between different regulators / langs.', function () {
            this.timeout(max_timeout)
            return Promise.all(
                regulators.reduce(
                    (_, regulator) =>
                        _.concat(
                            langs.map(lang =>
                                fetch(
                                    ['http://localhost:' + port, 'CURRENT', regulator, lang, '0'].join('/'),
                                    {
                                        method: 'GET',
                                        headers: {
                                            Cookie: 'manager_token=' + manager_token,
                                        }
                                    }
                                )
                                    .then(_ => _.buffer())
                                    .then(_ => msgpack.decode(new Uint8Array(_)))
                            )
                        ),
                    []
                )
            )
                .then(translations =>
                    translations.reduce(
                        (prev_translation, translation) => {
                            assert.deepStrictEqual(
                                Object.keys(toFlat(prev_translation)).filter(_ => _ !== 'root').sort(),
                                Object.keys(toFlat(translation)).filter(_ => _ !== 'root').sort()
                            )
                            return translation
                        },
                        translations.shift()
                    )
                )
        })

        it('Approve pending will: 1. Apply pending translations changes to current translations.  2. Remove pending from pendings. 3. Add pending to history.', function () {
            this.timeout(max_timeout)
            return fetch(
                root + '/admin/approve',
                {
                    method: 'POST',
                    headers: {
                        Cookie: 'manager_token=' + manager_token,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        locale,
                        token: translator_token
                    })
                }
            )
                .then(() => new Promise(y => setTimeout(() => y(), approve_pending_max_timeout)))
                .then(() =>
                    Promise.all([
                        fetch(
                            ['http://localhost:' + port, 'CURRENT', REGULATOR, locale, '0'].join('/'),
                            {
                                method: 'GET',
                                headers: {
                                    Cookie: 'manager_token=' + manager_token,
                                }
                            }
                        )
                            .then(_ => _.buffer())
                            .then(_ => msgpack.decode(new Uint8Array(_)))
                            .then(_ => assert.equal(_.title, translations.title)),
                        fetch(
                            root + '/admin/pending',
                            {
                                method: 'POST',
                                headers: {
                                    Cookie: 'manager_token=' + manager_token,
                                }
                            }
                        )
                            .then(_ => _.buffer())
                            .then(_ => msgpack.decode(new Uint8Array(_)))
                            .then(pendings =>
                                assert.equal(pendings[locale][translator_token], undefined)
                            ),
                        fetch(
                            root + '/admin/history',
                            {
                                method: 'POST',
                                headers: {
                                    Cookie: 'manager_token=' + manager_token,
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify({
                                    cache_length: 0
                                })
                            }
                        )
                            .then(_ => _.buffer())
                            .then(_ => msgpack.decode(new Uint8Array(_)))
                            .then(_ => _.map(_ => msgpack.decode(_)))
                            .then(history =>
                                assert.ok(
                                    history.find(_ => _.locale === locale && _.token === translator_token)
                                )
                            )
                    ])
                )
        })

        it('Dismiss pending should remove it from pendings.', function () {
            this.timeout(max_timeout)
            return Promise.resolve()
                .then(() =>
                    fetch(
                        root + '/translation',
                        {
                            method: 'POST',
                            headers: {
                                Cookie: 'translator_token=' + translator_token,
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                                map_lang_translations: {[locale]: translations}
                            })
                        }
                    )
                )
                .then(() =>
                    fetch(
                        root + '/admin/dismiss',
                        {
                            method: 'POST',
                            headers: {
                                Cookie: 'manager_token=' + manager_token,
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                                locale,
                                token: translator_token
                            })
                        }
                    )
                )
                .then(() =>
                    fetch(
                        root + '/admin/pending',
                        {
                            method: 'POST',
                            headers: {
                                Cookie: 'manager_token=' + manager_token,
                            }
                        }
                    )
                )
                .then(_ => _.buffer())
                .then(_ => msgpack.decode(new Uint8Array(_)))
                .then(pendings =>
                    assert.equal(pendings[locale][translator_token], undefined)
                )
        })

        it('Route /admin/words_count/en should respond with count words at EN language same as do at words_count() function.', function () {
            this.timeout(max_timeout)
            return fetch(
                root + '/admin/words_count/en',
                {
                    headers: {
                        Cookie: 'manager_token=' + manager_token
                    }
                }
            )
                .then(_ => _.text())
                .then(text => Number(text))
                .then(count =>
                    fetch(
                        root + '/admin/CURRENT/en',
                        {
                            headers: {
                                Cookie: 'manager_token=' + manager_token
                            }
                        }
                    )
                        .then(_ => _.json())
                        .then(translation =>
                            assert.equal(count, words_count(translation, 0, () => null))
                        )
                )
        })

        it('Words count have exclude options. Here example of excluding pages which has suffix in route: "/help-resources".', function () {
            this.timeout(max_timeout)
            return fetch(
                root + '/admin/words_count/en/help-resources',
                {
                    headers: {
                        Cookie: 'manager_token=' + manager_token
                    }
                }
            )
                .then(_ => _.text())
                .then(_ => Number(_))
                .then(count =>
                    fetch(
                        root + '/admin/CURRENT/en',
                        {
                            headers: {
                                Cookie: 'manager_token=' + manager_token
                            }
                        }
                    )
                        .then(_ => _.json())
                        .then(translation =>
                            assert.equal(count, words_count(translation, 0, key => key === 'help-resources'))
                        )
                )
        })

        it('Route /admin/CURRENT/ru should return Russian translations from DB.', function () {
            this.timeout(max_timeout)
            const lang = 'ru'
            return Promise.all([
                new Promise((y, n) =>
                    redis((_, db) =>
                        db.hget(redis.CURRENT[REGULATOR], lang, (e, _) =>
                            e
                                ? n(e)
                                : y(msgpack.decode(_))
                        )
                    )
                ),
                fetch(
                    [root, 'admin', 'CURRENT', lang].join('/'),
                    {
                        method: 'GET',
                        headers: {
                            Cookie: 'manager_token=' + manager_token
                        }
                    }
                )
                    .then(_ => _.json())
            ])
                .then(([db, web]) =>
                    assert.deepEqual(web, db)
                )
        })

    })

    after(function () {
        this.timeout(max_timeout)
        server.close()
        registration.destroy()
        return Promise.all([
            new Promise((y, n) => redis((_, db ) =>
                db.quit
                    ? db.quit(err => err ? n(err) : y())
                    : y()
            )),
            new Promise((y, n) => redis_pub((_, pub) =>
                pub.quit
                    ? pub.quit(err => err ? n(err) : y())
                    : y()
            )),
            new Promise((y, n) => redis_sub((_, sub) =>
                sub.quit
                    ? sub.quit(err => err ? n(err) : y())
                    : y()
            ))
        ])
    })
})
