const express = require('express')
const config = require('../config')
const fetch = require('node-fetch')
const msgpack = require('msgpack-lite')

const app = express.Router()


app.use((req, res, next) =>
    req.cookies.translator_token
        ?
            fetch(
                config.auth_service_url + '/translator/token_validate',
                {
                    method: 'POST',
                    body: msgpack.encode({token: req.cookies.translator_token})
                }
            )
                .then(_ => _.ok ? _.buffer() : Promise.reject(new Error(_.status)))
                .then(_ => msgpack.decode(_))
                .then(valid => {
                    res.locals.isTranslator = valid
                    next()
                })
                .catch(() => {
                    res.clearCookie('translator_token')
                    next()
                })
        :
            next()
)

app.use((req, res, next) =>
    req.cookies.manager_token
        ?
            fetch(
                config.auth_service_url + '/manager/token_validate',
                {
                    method: 'POST',
                    body: msgpack.encode({token: req.cookies.manager_token})
                }
            )
                .then(_ => _.ok ? _.buffer() : Promise.reject(new Error(_.status)))
                .then(_ => msgpack.decode(_))
                .then(valid => {
                    res.locals.isManager = valid
                    next()
                })
                .catch(() => {
                    res.clearCookie('manager_token')
                    next()
                })
        :
            next()
)


module.exports = app
