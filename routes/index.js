var express = require("express");
var http = require("http");
var jwt = require("jsonwebtoken");
var router = express.Router();
var reversePaths = require("../utils/reverseObject");
var config = require("../config");
var redis_pub = require("../redis_pub");
var channels = require('../models/channels')
var url2route = require("../utils/url2route");
var customPaths = config.routes;
var msgpack = require('msgpack-lite');
var regAPI = require('../models/registration')

function deep2flat(deep) {
    return Object.keys(deep).reduce(
        (acc, lang) => Object.assign(acc, reversePaths(deep[lang])),
        {}
    );
}

module.exports = routes => {
    routes = [routes, customPaths]
        .map(deep2flat)
        .reduce((acc, cur) => Object.assign(acc, cur));

    // Regservice data
    router.use(async (req, res, next) => {
        var headerCountry = req.headers['cloudfront-viewer-country'] || req.headers['country_code']
        var countryCode = (req.query.country_from || req.cookies.country_from || headerCountry || process.env.COUNTRY_CODE || '**').toLowerCase()
        res.locals.countryCode = countryCode
        res.locals.getCDN = function (cc) {
            if (res.locals.eu_host || res.locals.prefix_by_regulator === 'eu') {
                return 'https://cdn.icmarkets.eu';
            }

            if (res.locals.uk_host || res.locals.prefix_by_regulator === 'uk') {
                return 'https://cdn.icmarketsuk.com';
            }

            if (countryCode === 'cn' || cc === 'cn') {
                return 'https://cdn.icmarkets-zhv.com';
            } else if (countryCode === 'it' || cc === 'it') {
                return 'https://cdn.icmarkets-it.com';
            }

            return 'https://cdn.icmarkets.com';
        };
        res.locals.getEU = function () {
           if (req.hostname.includes('staging.icmarkets')) return 'https://staging.icmarkets.eu'
            return 'https://www.icmarkets.eu'
        };
        res.locals.getWebsiteURL = function (cc) {
            if (res.locals.eu_host || res.locals.prefix_by_regulator === 'eu') {
                return 'https://www.icmarkets.eu';
            }
            if (res.locals.sc_host) {
                return 'https://www.icmarkets.sc';
            }
            if (res.locals.bs_host) {
                return 'https://www.icmarkets.bs';
            }
            if (res.locals.uk_host) {
                return 'https://www.icmarketsuk.com';
            }
            if (res.locals.ru_host) {
                return 'https://www.icmarkets.ru';
            }
            if (res.locals.mu_host) {
                return 'https://www.icmarkets.mu';
            }
            if (res.locals.ky_host) {
                return 'https://www.icmarkets.ky';
            }
            if (countryCode === 'cn' || cc === 'cn') {
                return 'https://icmarkets-zhv.com';
            } else if (countryCode === 'it' || cc === 'it') {
                return 'https://icmarkets-it.com';
            }
            if (res.locals.com_host) {
                return 'https://www.icmarkets.com';
            }
            return 'https://www.icmarkets.com';
        };
        res.locals.getCurrentURL = function (cc) {
            if (res.locals.eu_host) {
                return 'www.icmarkets.eu';
            }
            if (res.locals.sc_host) {
                return 'www.icmarkets.sc';
            }
            if (res.locals.bs_host) {
                return 'www.icmarkets.bs';
            }
            if (res.locals.uk_host) {
                return 'www.icmarketsuk.com';
            }
            if (res.locals.com_host) {
                return 'www.icmarkets.com';
            }
            if (res.locals.ru_host) {
                return 'www.icmarkets.ru';
            }
            if (res.locals.mu_host) {
                return 'www.icmarkets.mu';
            }
            if (res.locals.ky_host) {
                return 'www.icmarkets.ky';
            }

            if (countryCode === 'cn' || cc === 'cn') {
                return 'icmarkets-zhv.com';
            } else if (countryCode === 'it' || cc === 'it') {
                return 'icmarkets-it.com';
            }
            return 'www.icmarkets.com';
        };
        res.locals.branching = await regAPI.getBranchData(res.locals.countryCode)
        res.locals.isDefaultRegulator = await regAPI.isDefaultRegulator(res.locals.countryCode, req.regulator)
        regAPI.getCysecCountriesList(res.locals.countryCode).then(cysecCountriesList => {
            res.locals.isCysecCountry = cysecCountriesList.indexOf(countryCode) !== -1
            res.locals.cysecCountriesList = cysecCountriesList
            res.locals.cysecCountriesString = cysecCountriesList.join('__')
            next()
        }).catch(next)
    })

    // Main renderer
    router.use(function(req, res, next) {
        var route = url2route(req.url);

        if (route === "open-trading-account/live" || route === "help-resources/help-centre") {
            res.locals.jwt = jwt.sign({data: "Welcome!"}, config.JWT_SECRET, {expiresIn: 24 * 60 * 60});
        }

        if (route === "open-trading-account/live") {
            res.locals.utcTimestamp = Date.now();
        }
        if ( res.locals.regulator == 'fca') {
            if (route === "introduction/icmarkets-mobile-app" || route === "company/careers" || route === "help-resources/help-centre" || route === "trading-markets/digitalcurrency" || route === "trading-accounts/ctrader-raw" || route === "trading-markets/stocks") {
                res.status(404);
                return next(new Error('Invalid route: ' + route));
            }

            const moreNavArray = [
                'company/about-icmarkets',
                'company/why-icmarkets',
                'company/regulation',
                'company/careers',
                'education/education-overview',
                'education/advantages-of-forex',
                'education/advantages-of-cfds',
                'education/video-tutorials',
                'education/web-tv',
                'go/webinars/upcoming',
                'go/landing-pages/podcast',
                'go/landing-pages/the-week-ahead',
                'help-resources/help-centre',
                'help-resources/forex-calculators',
                'help-resources/economic-calendar',
                'help-resources/forex-glossary',
                'help-resources/teamviewer',
                'forex-trading-platform/myfxbook-autotrade',
                'zulutrade'
            ]

            for (let i = 0;i <= moreNavArray.length;i++) {
                if (route === moreNavArray[i]) {
                    res.status(404);
                    return next(new Error('Invalid route: ' + route));
                }
            }
        }

        if ( res.locals.regulator == 'asic') {
            if (route === "forex-trading-tools/virtual-private-server") {
                res.locals.onProPage = 1;
                res.status(404);
                return next(new Error('Invalid route: ' + route));
            }
        }

        res.locals.onProPage = 0;
        if (route === "xp-trader") {
            res.locals.onProPage = 1;
        }

        if (!routes[route]) {
            res.status(404);
            return next(new Error('Invalid route: ' + route));
        }

        if (req.regulator == 'cysec' && !config.cysec_pages.includes(route)) {
            res.status(404);
            return next(new Error('Route:' + route + ' is not enabled for CySec'));
        }
        if (req.regulator != 'cysec' && config.cysec_pages_only.includes(route)) {
            res.status(404);
            return next(new Error('Route: ' + route + ' enabled only for CySec but asked for ' + req.regulator));
        }
        res.render(route, {}, (err, html) => {
            if (err) {
              res.status(500)
              return next(err);
            }

            // WRITE POINT into MONITORING SERVICE
            if (process.env.ICM_ENVIRONMENT) { // prevent store points from DEV
                var data = {
                    measurement: "www2",
                    tags: {
                        env: process.env.ICM_ENVIRONMENT,
                        country: res.locals.countryCode,
                        locale: res.locals.locale,
                        route: route || "/"
                    },
                    fields: {
                        value: 1
                    }
                };

                channels.get_monitoring_channel().then(monitoring_channel =>
                    redis_pub((e, pub) => {
                        if (e) return console.error('Pub Redis client not working during intent send to monitoring channel')
                        pub.publish(monitoring_channel, msgpack.encode(data))
                    })
                )
                data.tags.route = encodeURIComponent(data.tags.route)
                http.get(
                    config.monitoring_url + JSON.stringify(data),
                    response => {
                        response
                            .on('data', () => null)
                            .on('end', () => response.statusCode >= 300 && console.error("Monitoring service return " + response.statusCode + " statusCode"))
                    }
                ).on("error", (e) => console.error("WRITE POINT ERROR", e.message));
            }

            return res.send(html);
        });
    });
    return router;
};
