const futures = require('../models/futures')


module.exports = (req, res, next) => {

    res.locals.futuresIndex = futures.get_index(req.regulator)
    res.locals.futuresCommodity = futures.get_commodity(req.regulator)
    res.locals.futuresBonds = futures.get_bonds(req.regulator)

    next()
}
