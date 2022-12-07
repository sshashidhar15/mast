const reversePaths = require('../utils/reverseObject')
    ,     md5 = require('../utils/md5')
    ,     cache_md5 = {}
    ,     config = require('../config')
    ,     valid_lang = require('../utils/valid_lang')
    ,     url2route = require('../utils/url2route')
    ,     faq_sections = require('../models/faq_sections')
    ,     T = require('../utils/translator')
    ,     { localePath, clientAreaPath, changeLocale, changeRegulator, allRoutes, publicPath } = require('../utils/paths')
    ,     customPaths = config.routes
    ,     revertedCustomPaths = Object.keys(customPaths).reduce((res, lang) => {
    res[lang] = reversePaths(customPaths[lang])
    return res
}, {})

// eslint-disable-next-line complexity
module.exports = routes => (req, res, next) => {
    // [09:45 25.05.2021] Matthew von Abo: website language priority
    //
    // 1) Language assigned from cookie selected by user manually (return visitors)
    // 2) Browser language preference if no cookie (new visitors)
    // 3) National language with IP detection from the country code
    // 4) English if national language is not supported and no data from browser (outliers)

    const isSomeHost = res.locals.sc_host || res.locals.bs_host || res.locals.eu_host || res.locals.uk_host || res.locals.com_host || res.locals.ru_host || res.locals.cn_host || res.locals.mu_host || res.locals.ky_host
    let
        langRegex = isSomeHost ? /^[/]{0,1}[a-zA-Z]{2}/ : /^\/[a-zA-Z]{2}/,
        testRegex = isSomeHost ? /^[/]{0,1}[a-zA-Z]{2}(\/.*)?$/ : /^\/[a-zA-Z]{2}(\/.*)?$/,
        headerCountry = req.query.country_from || req.cookies.country_from || process.env.COUNTRY_CODE || req.headers['cloudfront-viewer-country'] || req.headers['country_code'],
        cookieLocale = req.cookies.user_want_language,
        { prefLocale } = req.i18n

    if (!valid_lang(prefLocale)) {
        // if from request (from the user browser) is coming unsupported locale
        prefLocale = headerCountry.toLowerCase()
    }
    if (!valid_lang(prefLocale)) {
        // if it is unsupported locale, use default EN
        prefLocale = 'en'
    }

    if (!testRegex.test(req.url)) {
        if (cookieLocale) {
            if (valid_lang(cookieLocale)) {
                prefLocale = cookieLocale
            } else if (headerCountry === 'cn') {
                prefLocale = 'cn'
                res.cookie('user_want_language', 'cn')
            } else if (headerCountry === 'it') {
                prefLocale = 'it'
                res.cookie('user_want_language', 'it')
            } else if (headerCountry === 'ru') {
                prefLocale = 'ru'
                res.cookie('user_want_language', 'ru')
            }
        } else if (headerCountry === 'cn') {
            prefLocale = 'cn'
            res.cookie('user_want_language', 'cn')
        } else if (headerCountry === 'it') {
            prefLocale = 'it'
            res.cookie('user_want_language', 'it')
        } else if (headerCountry === 'ru') {
            prefLocale = 'ru'
            res.cookie('user_want_language', 'ru')
        }

        let redirect_url = '/' + config.regulators_prefixes[req.regulator] + '/' + prefLocale;
        if (res.locals.sc_host || res.locals.bs_host || res.locals.eu_host || res.locals.uk_host || res.locals.com_host || res.locals.ru_host || res.locals.cn_host || res.locals.mu_host || res.locals.ky_host) {
            redirect_url = '/' + prefLocale;
        }
        let redirect_route = req.url.replace(/^\//, '').replace(/\/$/, '');
        redirect_url = redirect_url + '/' + redirect_route;

        return res.redirect(redirect_url);
    }

    const parts = langRegex.exec(req.url)
    const language = (parts && parts.length) ? parts[0].replace(/[^a-z]/, '') : null

    let forceRedirect = false;
    // eslint-disable-next-line no-negated-condition
    if (headerCountry === 'cn') {
        prefLocale = 'cn'
    }
    if (headerCountry === 'it') {
        prefLocale = 'it'
    }
    if (headerCountry === 'ru') {
        prefLocale = 'ru'
    }
    if (language !== prefLocale) {
        if (!cookieLocale) {
            forceRedirect = true;
            // eslint-disable-next-line no-negated-condition
        } else if (valid_lang(cookieLocale) && language !== cookieLocale) {
            prefLocale = cookieLocale;
            forceRedirect = true;
        }
        // eslint-disable-next-line no-negated-condition
    } else if (cookieLocale && valid_lang(cookieLocale) && language !== cookieLocale) {
        prefLocale = cookieLocale;
        forceRedirect = true;
    }
    if (forceRedirect) {
        const cleanPath = url2route(req.url.replace(langRegex, '') || '/');
        const en_default_path = (revertedCustomPaths[language] && revertedCustomPaths[language][cleanPath]) || cleanPath;
        let final_clean_path = (prefLocale === 'en')
            ? (revertedCustomPaths[language] && revertedCustomPaths[language][cleanPath]) || cleanPath
            : (customPaths[prefLocale] && customPaths[prefLocale][en_default_path]) || en_default_path;

        if (res.locals.sc_host || res.locals.bs_host || res.locals.eu_host || res.locals.uk_host || res.locals.com_host || res.locals.ru_host || res.locals.cn_host || res.locals.mu_host || res.locals.ky_host) {
            if (final_clean_path === prefLocale || final_clean_path.length < 3) {
                final_clean_path = '';
            }
            return res.redirect(`/${prefLocale}/${final_clean_path}`);
        }
        return res.redirect(`/${config.regulators_prefixes[req.regulator]}/${prefLocale}/${final_clean_path}`);
    }

    req.i18n.setLocale(language)
    req.url = req.url.replace(langRegex, '') || '/'
    var custom = revertedCustomPaths[language]
        ,   cleanPath = url2route(req.url)
        ,   isEditing = !!(res.locals.isTranslator && req.cookies.edit_translations)

    if (custom && custom[cleanPath]) {
        req.url = custom[cleanPath];
    }

    let translator = new T(req.i18n, res.locals.isTranslator, res.locals.isManager, isEditing, res.locals.app)

    res.locals = {
        ...res.locals,
        config,
        raw_accept_language: req.headers['accept-language'],
        enableLivechat: req.url.indexOf('help-centre') !== -1, // true
        locale: req.i18n.locale,
        $t: translator.$t,
        translator: translator,
        untranslated_keys: translator.untranslated_keys,
        isEditing,
        isTranslator: !!res.locals.isTranslator,
        isManager: !!res.locals.isManager,
        translations: res.locals.isTranslator ? req.i18n.locales[req.i18n.locale] : null,
        setI18nPrefix: translator.setI18nPrefix,
        prevI18nPrefix: translator.prevI18nPrefix,
        urlQuery: req.query,
        faq_sections: faq_sections.get_faq_sections(req.regulator, req.i18n.locale),

        md5: fn => (cache_md5[fn] = cache_md5[fn] || fn + '?' + md5(publicPath(fn))) && cache_md5[fn],
        localePath: localePath.bind(null, req, routes),
        clientAreaPath: clientAreaPath.bind(null, req, routes),
        changeLocale: changeLocale.bind(null, req, res, routes),
        changeRegulator: changeRegulator.bind(null, req, res, routes),
        allRoutes: allRoutes.bind(null, req, routes)
    }

    next()
}
