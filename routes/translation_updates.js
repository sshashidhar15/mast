const applyDelta = require('../utils/apply_delta')
const pending_deltas = require('../models/pending_deltas')
const translation = require('../models/translation')


module.exports = (req, res, next) => {
    var pending
    while (pending = pending_deltas[req.regulator].eject())
        translation.set_current_by_lang(
            req.regulator,
            pending.lang,
            applyDelta(
                translation.get_current_by_lang(req.regulator, pending.lang),
                pending.delta
            )
        )
    next()
}
