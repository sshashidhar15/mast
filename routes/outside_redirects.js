const QS = require('query-string')
    , url2route = require('../utils/url2route')
    , rules = require('../config').per_branch_redirects_to_outside;

module.exports = (req, res, next) => {
    var route = url2route(req.url);
    let branch = res.locals.branchID
    if (!rules[branch] || !rules[branch][route]) {
        return next()
    }

    let redirect = rules[branch][route]
    if (Object.keys(req.query).length) {
        redirect += '?' + QS.stringify(req.query)
    }
    res.redirect(redirect)
}
