const QS = require('query-string')
  , url2route = require('../utils/url2route')
  , rules = require('../config').per_branch_redirects
  , regulators_prefixes = require('../config').regulators_prefixes


module.exports = (req, res, next) => {
  var route = url2route(req.url);
  let branch = res.locals.branchID
  if (!rules[branch] || !rules[branch][route]) {
    return next()
  }

  let regulator = req.regulator ? regulators_prefixes[req.regulator] : null
  let redirect = '/' + rules[branch][route]
  let locale = res.locals.locale || 'en'

  if (regulator) {
    redirect = '/' + regulator + '/' + locale + redirect
  }

  if (Object.keys(req.query).length) {
    redirect += '?' + QS.stringify(req.query)
  }

  res.redirect(redirect)
}
