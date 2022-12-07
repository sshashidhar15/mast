const QS = require('query-string')
,     url2route = require('../utils/url2route')
,     valid_lang = require('../utils/valid_lang')
,     rules = require('../config').seo_redirects
,     regulators_prefixes = require('../config').regulators_prefixes;

module.exports = (req, res, next) => {
  let langRegex = /^\/[a-zA-Z]{2}/
  if (res.locals.sc_host || res.locals.bs_host || res.locals.eu_host || res.locals.uk_host || res.locals.com_host || res.locals.ru_host || res.locals.cn_host || res.locals.mu_host || res.locals.ky_host) {
    langRegex = /[a-zA-Z]{2}/
  }

  let cleanUrl = url2route(req.url.replace(langRegex, ''))
  if (!rules[cleanUrl] && rules[cleanUrl] !== '')
    return next()

  let regulator = req.regulator ? regulators_prefixes[req.regulator] : null

  let lang = valid_lang(req.url.substring(1, 3))
    ? langRegex.exec(req.url)[0].replace(/^\/|\/$/, '')
    : req.cookies.user_want_language

  let redirect = (lang ? '/' + lang : '' ) + '/' + rules[cleanUrl]
  if (regulator && lang) {
    redirect = '/' + regulator + redirect
  }

  if (Object.keys(req.query).length) {
    redirect += '?' + QS.stringify(req.query)
  }

  res.redirect(redirect)
}
