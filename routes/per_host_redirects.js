const QS = require('query-string')
  , url2route = require('../utils/url2route')
  , rules = require('../config').per_host_redirects;

module.exports = (req, res, next) => {
  var route = url2route(req.url);
  let host = res.locals.sc_host
    ? 'sc_host'
    : res.locals.bs_host
      ? 'bs_host'
      : res.locals.eu_host
        ? 'eu_host'
        : res.locals.uk_host
        ? 'uk_host'
          : res.locals.com_host
            ? 'com_host'
            : res.locals.ru_host
              ? 'ru_host'
              : res.locals.cn_host
                ? 'cn_host'
                : res.locals.mu_host
                  ? 'mu_host'
                  : res.locals.ky_host
                    ? 'ky_host'
                    : '-'
  if (!rules[host] || !rules[host][route]) {
    return next()
  }

  let redirect = '/' + rules[host][route]
  if (Object.keys(req.query).length) {
    redirect += '?' + QS.stringify(req.query)
  }
  res.redirect(redirect)
}
