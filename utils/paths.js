const path = require('path')
,     qs = require('query-string')
,     config = require('../config')
,     url2route = require('../utils/url2route')
,     customPaths = config.routes

function localePath(req, routes, p, query) {
  let { locale } = req.i18n;
  let uri = '/' + path.join(config.regulators_prefixes[req.regulator], locale, routes[locale][p])
  if (req.sc_host || req.bs_host || req.eu_host || req.uk_host || req.com_host || req.ru_host || req.cn_host || req.mu_host || req.ky_host) {
    uri = '/' + path.join(locale, routes[locale][p])
  }

  if (query)
    uri += '?' + qs.stringify(query)

  return uri
}

function allRoutes(req, routes) {
  return {
    host: (req.protocol + '://' + req.headers.host),
    routes: routes,
    current: url2route(req.url).replace(/\//, '-')
  }
}

function clientAreaPath(req, routes, query) {
  let { locale } = req.i18n;
  let headerCountry = (req.query.country_from || req.cookies.country_from || process.env.COUNTRY_CODE || req.headers['cloudfront-viewer-country'] || req.headers['country_code'] || '').toLowerCase();
  let uri = config.global_client_area_url;
  if (headerCountry === 'cn' || locale === 'cn') {
    uri = config.chinese_client_area_url;
  } else if (headerCountry === 'it') {
    uri = config.italian_client_area_url;
  } else if (req.regulator === 'cysec') {
    uri = config.eu_client_area_url;
  } else if (req.regulator === 'fca') {
    uri = config.uk_client_area_url;
  } else if (req.hostname.includes('.bs')) {
    uri = config.client_area_bs_url;
  } else if (req.hostname.includes('-global')) {
    uri = config.client_area_global_url;
  } else if (req.hostname.includes('-ru') || headerCountry === 'ru') {
    uri = config.client_area_ru_url
  }
  if (query) uri += '?' + qs.stringify(query);
  return uri
}

function changeLocale(req, res, routes, lang, query = {}) {
  let { locale } = req.i18n;
  let custom = customPaths[lang]
  ,   cleanPath = url2route(req.url)

  let url = (custom && custom[cleanPath]
        ? custom[cleanPath]
        : cleanPath)

  if (locale !== lang) {
    query.set_lang = lang
    url += '?' + qs.stringify(query)
  }

  if (req.sc_host || req.bs_host || req.eu_host || req.uk_host || req.com_host || req.ru_host || req.cn_host || req.mu_host || req.ky_host) {
    return `/${lang}/${url}`
  }

  return `/${config.regulators_prefixes[req.regulator]}/${lang}/${url}`
}

function changeRegulator(req, res, routes, reg, query = {}) {
  let { locale } = req.i18n
  ,   custom = customPaths[locale]
  ,   cleanPath = url2route(req.url)


  let url = (custom && custom[cleanPath]
        ? custom[cleanPath]
        : cleanPath)

  var target = qs.stringify(query);
  if (url) url = '/' + url;
  url += (target
      ? '?' + target + '&regulator=' +  config.branch_wcf_ids[reg]
      : '?regulator=' +  config.branch_wcf_ids[reg]
  );

  return `/${config.regulators_prefixes[reg]}/${locale}${url}`
}

function publicPath (fn) {
    return path.join(__dirname, '..', 'public', fn)
}

module.exports = {
  localePath,
  changeLocale,
  changeRegulator,
  clientAreaPath,
  allRoutes,
  publicPath
}
