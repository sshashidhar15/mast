const express = require('express')
const translation = require('../models/translation')

const app = express.Router()


app.get('/translator/login', (req, res) => {
    if (req.query.translator_token) {
        res.cookie('translator_token', req.query.translator_token)
        if (req.cookies.translator_token !== req.query.translator_token) {
            res.cookie('translator_should_load_his_translations_from_pendings', true)
        }
    }
    res.redirect('/')
})

app.post('/translator/translations_from_pending', (req, res) =>
    res.locals.isTranslator
        ?
            res.json(
                translation.get_translations_for_token_by_lang_from_not_approved_pendings(req.regulator, req.cookies.translator_token)
            )
        :
            res.status(
                req.cookies.translator_token
                    ? 401
                    : 403
            ).end()
)

app.post('/translation', (req, res, next) => {
    if (!res.locals.isTranslator)
        return res.status(
            req.cookies.translator_token
                ? 401
                : 403
        ).end()

    translation.add_pendings(req.regulator, req.cookies.translator_token, req.body.map_lang_translations)
        .then(() => res.json({ok: true}))
        .catch(next)
})

module.exports = app
