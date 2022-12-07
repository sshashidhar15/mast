const msgpack = require('msgpack-lite')
const fetch = require('node-fetch')
const config = require('../config')
const cache = {}

module.exports = token =>
    cache[token]
        ? Promise.resolve(cache[token])
        : fetch(
            config.auth_service_url + '/manager/token2login',
            {
                method: 'POST',
                body: msgpack.encode({token})
            }
        )
            .then(_ => _.buffer())
            .then(_ => msgpack.decode(_).login)
            .then(login => {
                cache[token] = login
                return login
            })
