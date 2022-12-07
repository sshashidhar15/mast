const URL = require('url');
const {branch_wcf_ids, default_regulator, icm_internal_ips, legacy_prefixes, regulators, regulators_prefixes,google_internal_ips_for_seo, apac_countries} = require('../config');
const Registration = require('../models/registration');
const comHostRegex = /(.com|localhost:8080)\/(en|cn|th|id|ko|de|fr|pt|es|vn|ru|ar|cz|my|it|bg|hr|tw)(\/.*)?$/;
const getFullUrl = (req) => `${req.protocol}://${req.headers.host}${req.originalUrl}`;

module.exports = (req, res, next) => {
    let regulator_by_prefix = {};

    if (req.url.includes('admin')) {
        regulator_by_prefix = {
            au: 'asic',
            bs: 'scb',
            eu: 'cysec',
            global: 'fsa',
            sc: 'fsa',
            intl: 'scb',
            uk: 'fca',
            mu: 'fsc',
            ky: 'cima'
        };
    } else {
        regulator_by_prefix = {
            au: 'asic',
            bs: 'scb',
            eu: 'cysec',
            global: 'fsa',
            sc: 'fsa',
            intl: 'scb',
            uk: 'fca',
            mu: 'fsc',
            ky: 'cima'
        };
    }

    let prefix_list = Object.keys(regulator_by_prefix);

    const isEuHost = process.env.IS_EU_HOST === 'true' || req.hostname.includes('icmarkets.eu');
    const isScHost = process.env.IS_SC_HOST === 'true' || req.hostname.includes('icmarkets.sc');
    const isCnHost = process.env.IS_CN_HOST === 'true' || req.hostname.includes('icmarkets-zh');
    const isRuHost = process.env.IS_RU_HOST === 'true' || req.hostname.includes('icmarkets.ru');
    const isBsHost = process.env.IS_BS_HOST === 'true' || req.hostname.includes('icmarkets.bs');
    const isUkHost = process.env.IS_UK_HOST === 'true' || req.hostname.includes('icmarketsuk.com');
    const isMuHost = process.env.IS_MU_HOST === 'true' || req.hostname.includes('icmarkets.mu');
    const isKyHost = process.env.IS_KY_HOST === 'true' || req.hostname.includes('icmarkets.ky');

    const fullURL = getFullUrl(req);
    const isComHost = comHostRegex.test(fullURL);

    const reqHostname = req.hostname;

    function getCurrentDomain() {
        let currentDomain = 'icmarkets.com';

        if (reqHostname.includes('icmarkets')) {
            currentDomain = 'icmarkets' + reqHostname.split('icmarkets')[1];
        }

        if (reqHostname.includes('stagingcn.icmarkets.com')) {
            currentDomain = 'stagingcn.icmarkets.com';
        }

        if (reqHostname == 'localhost') {
            currentDomain = 'icmarkets.com';
        }

        return currentDomain;
    }

    function getUserAccessFrom() {
        let accessFrom = 'outside';
        let ip = (req.headers['x-forwarded-for'] || '').split(',')[0] || req.connection.remoteAddress;
        let internalIPs = icm_internal_ips || [];
        let googleIPs = google_internal_ips_for_seo || [];
        if (internalIPs.includes(ip) || reqHostname == 'localhost' || req.hostname.includes('localdev') || googleIPs.includes(ip)) {
            accessFrom = 'inside';
        }

        return accessFrom;
    }

    function getIP() {
        let ip = req.header('x-forwarded-for') || req.connection.remoteAddress;

        return ip;
    }

    function getAsicWebsiteUrl() {
        let res = '';

        if (getUserAccessFrom() === 'outside') {
            res = 'https://www.icmarkets.com/au/en';
        }

        return res;
    }

    function getCysecWebsiteUrl() {
        let res = '';

        if (getUserAccessFrom() === 'outside') {
            res = 'https://www.icmarkets.eu/en';
        }

        return res;
    }

    function getFcaWebsiteUrl() {
        let res = '';

        if (getUserAccessFrom() === 'outside') {
            res = 'https://www.icmarketsuk.com/en';
        }

        return res;
    }

    function isAPACcountry(countryCode) {
        return apac_countries.includes(countryCode);
    }

    res.locals.userAccessFrom = getUserAccessFrom(); // 'inside' | 'outside'
    res.locals.getIP = getIP();
    res.locals.isAPACcountry = isAPACcountry;
    res.locals.isFromLocal = req.hostname == 'localhost' || req.hostname.includes('localdev');
    res.locals.isEuHost = isEuHost;
    res.locals.isScHost = isScHost;
    res.locals.isCnHost = isCnHost;
    res.locals.isRuHost = isRuHost;
    res.locals.isBsHost = isBsHost;
    res.locals.isUkHost = isUkHost;
    res.locals.isMuHost = isMuHost;
    res.locals.isKyHost = isKyHost;

    const urlObj = URL.parse(req.url);
    const { path } = urlObj;
    let regulatorPrefix = prefix_list.includes(path.split('/')[1]) ? path.split('/')[1] : '';

    if (isCnHost) {
        regulatorPrefix = 'global';
    }

    const query = Object.keys(req.query).reduce(
        (acc, name) => {
            acc[name.toLowerCase()] = req.query[name];

            return acc;
        },
        {}
    );

    const headerCountry = (req.headers['cloudfront-viewer-country'] || req.headers['country_code'] || '').toLowerCase();
    let countryCode = process.env.COUNTRY_CODE || headerCountry;

    if (res.locals.userAccessFrom === 'inside' && (query.country_from || req.cookies.country_from)) {
        countryCode = query.country_from || req.cookies.country_from;
    }

    (regulatorPrefix === 'au'
        ? Promise.resolve('asic')
        : (regulatorPrefix === 'eu' || (countryCode === 'cy' || countryCode === 'it'))
            ? Promise.resolve('cysec')
            : regulatorPrefix === 'global'
                ? Promise.resolve('fsa')
                : regulatorPrefix === 'intl'
                    ? Promise.resolve('scb')
                    : regulatorPrefix === 'uk'
                        ? Promise.resolve('fca')
                        : regulatorPrefix === 'mu'
                            ? Promise.resolve('fsc')
                            : regulatorPrefix === 'ky'
                                ? Promise.resolve('cima')
                                : Promise.resolve(default_regulator)
    ).then(default_regulator_by_country_code => {
        if (isEuHost) {
            default_regulator_by_country_code = 'cysec';
        }

        if (isComHost || isScHost) {
            default_regulator_by_country_code = 'fsa';
        }

        if (isBsHost) {
            default_regulator_by_country_code = 'scb';
        }

        if (isUkHost) {
            default_regulator_by_country_code = 'fca';
        }

        if (isMuHost) {
            default_regulator_by_country_code = 'fsc';
        }

        if (isKyHost) {
            default_regulator_by_country_code = 'cima';
        }

        if (default_regulator_by_country_code === 'cysec' && !isEuHost) {
            default_regulator_by_country_code = (countryCode.toLowerCase() === 'cy' || countryCode.toLowerCase() === 'it') ? 'cysec' : 'fsa';
        }

        const prefix_by_country_code = (req.cookies.manager_token && req.url.includes('/admin/')
            ? legacy_prefixes.includes(regulatorPrefix)
                ? regulators_prefixes[regulator_by_prefix[regulatorPrefix]]
                : regulatorPrefix
            : regulators_prefixes[default_regulator_by_country_code]);

        if (req.cookies.manager_token && req.url.includes('/admin/')) {
            default_regulator_by_country_code = regulator_by_prefix[regulatorPrefix] || default_regulator || 'cysec';
        }

        let _regulator = regulatorPrefix ? regulator_by_prefix[regulatorPrefix] : default_regulator_by_country_code;

        regulators.reduce((locals, r) => {
            locals[r] = _regulator === r;

            return locals;
        }, res.locals);

        urlObj.pathname = path.split('/').splice(1, 1).join('/');
        if (isEuHost || isUkHost || isScHost || isCnHost || isRuHost || isBsHost || isMuHost || isComHost) {
            urlObj.pathname = path.split('/').splice(0, 1).join('/');
        }

        let currentBranchID = branch_wcf_ids[_regulator];
        let isSupportedBranch = false;
        let userAcceptedUnsupportedBranch = false;
        let availableSomeBranch = false;
        let suggestedBranch = '3';
        let suggestedCountry = '';
        let countryFromUpper = countryCode.toUpperCase();

        Promise.all([Registration.getAllCountries(), Registration.getCysecCountriesList()]).then(function ([countries, eu_countries]) {
            let countryData = countries.find(c => c.code === countryFromUpper);

            if (countryData && countryData.branching) {
                let currentBranchInfoForCountryFrom = countryData.branching.find(b => b.branch === currentBranchID);

                availableSomeBranch = !!countryData.branching.find(b => b.status === '1');

                if (currentBranchInfoForCountryFrom && currentBranchInfoForCountryFrom.status === '1') {
                    isSupportedBranch = true;
                    suggestedCountry = countryData.code.toLowerCase();
                    suggestedBranch = currentBranchID;
                } else {
                    let availableBranch = countryData.branching.find(b => b.status === '1');

                    isSupportedBranch = false;
                    suggestedCountry = '';
                    suggestedBranch = availableBranch ? availableBranch.branch : 0;
                }
            }

            if (eu_countries.includes(countryCode.toLowerCase()) && currentBranchID !== '2') {
                isSupportedBranch = false;
                suggestedBranch = '2';
                suggestedCountry = '';
            }

            if (!isSupportedBranch) {
                userAcceptedUnsupportedBranch = !!(req.cookies.user_accepted_unsupported_branch && req.cookies.user_accepted_unsupported_branch === currentBranchID);
            }

            let redirectTo = '';

            req.url = req.url.replace(new RegExp(`^/${regulatorPrefix}`), '');
            if (!req.url.includes('/')) {
                req.url = '/';
            }

            if (regulatorPrefix === 'eu') {
                redirectTo = getCysecWebsiteUrl();
            }

            if (regulatorPrefix === 'uk') {
                redirectTo = getFcaWebsiteUrl();
            }

            if (countryCode.toLowerCase() === 'au' && (default_regulator_by_country_code != 'asic' || regulatorPrefix != 'au')) {
                redirectTo = getAsicWebsiteUrl();
            }

            if ((countryCode.toLowerCase() === 'cy' || countryCode.toLowerCase() === 'it') && !isEuHost && (default_regulator_by_country_code != 'cysec' || regulatorPrefix != 'eu')) {
                redirectTo = getCysecWebsiteUrl();
            }

            // Force Indonesia clients to visit Global site instead of AU
            if (countryCode.toLowerCase() === 'id' && regulatorPrefix === 'au') {
                redirectTo = req.protocol + '://' + req.hostname + '/global/en';
            }

            if (redirectTo !== '') {
                return res.redirect(redirectTo);
            }

            req.regulator = regulatorPrefix ? regulator_by_prefix[regulatorPrefix] : default_regulator_by_country_code;
            req.eu_host = isEuHost ? 1 : 0;
            req.sc_host = isScHost ? 1 : 0;
            req.bs_host = isBsHost ? 1 : 0;
            req.cn_host = isCnHost ? 1 : 0;
            req.ru_host = isRuHost ? 1 : 0;
            req.uk_host = isUkHost ? 1 : 0;
            req.mu_host = isMuHost ? 1 : 0;
            req.ky_host = isKyHost ? 1 : 0;
            req.com_host = isComHost ? 1 : 0;
            res.locals.eu_host = isEuHost ? 1 : 0;
            res.locals.sc_host = isScHost ? 1 : 0;
            res.locals.bs_host = isBsHost ? 1 : 0;
            res.locals.cn_host = isCnHost ? 1 : 0;
            res.locals.ru_host = isRuHost ? 1 : 0;
            res.locals.uk_host = isUkHost ? 1 : 0;
            res.locals.mu_host = isMuHost ? 1 : 0;
            res.locals.ky_host = isKyHost ? 1 : 0;
            res.locals.com_host = isComHost ? 1 : 0;
            res.locals.regulator = regulatorPrefix ? regulator_by_prefix[regulatorPrefix] : default_regulator_by_country_code;
            res.locals.prefix_by_regulator = regulatorPrefix || prefix_by_country_code;
            res.locals.branchID = regulatorPrefix ? branch_wcf_ids[regulator_by_prefix[regulatorPrefix]] : currentBranchID;
            res.locals.current_domain = getCurrentDomain();
            res.locals.forceCountryFrom = query.country_from || req.cookies.country_from || false;
            res.locals.is_eu_country_from = eu_countries.includes(countryCode.toLowerCase()) ? 1 : 0;
            res.locals.is_supported_branch = isSupportedBranch ? 1 : 0;
            res.locals.is_available_some_branch = availableSomeBranch ? 1 : 0;
            res.locals.suggested_branch = suggestedBranch;
            res.locals.suggested_country = suggestedCountry;
            res.locals.user_accepted_unsupported_branch = userAcceptedUnsupportedBranch ? 1 : 0;

            next();
        });
    })
}
