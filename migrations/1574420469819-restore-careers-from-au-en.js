const redis = require('../redis')
const msgpack = require('msgpack-lite')
const config = require('../config')
const {regulators} = config
const langs = config.locales.map(_ => _.code)
const prefix = 'Restore careers from AU/EN '

module.exports.up = next =>
    console.info(prefix + 'up') ||
    redis((e, db) => {
        if (e) return console.error(prefix + 'up fail: ' + JSON.stringify(e)) || process.exit(1)
        db.hget(redis.CURRENT.asic, 'en', (e, _) => {
            if (e) return console.error(prefix + 'up fail: ' + JSON.stringify(e.messsage || e)) || process.exit(1)

            const {careers} = msgpack.decode(_)

            Promise.all(
                regulators.reduce(
                    (acc, regulator) =>
                        acc.concat(
                            langs.map(lang =>
                                new Promise((y, n) =>
                                    db.hget(redis.CURRENT[regulator], lang, (e, _) => {
                                        if (e) return n(e)
                                        const translation = msgpack.decode(_)
                                        translation.careers = careers
                                        db.hset(redis.CURRENT[regulator], lang, msgpack.encode(translation), e =>
                                            e ? n(e) : y(console.info(prefix + '' + regulator + ' ' + lang + ' patched'))
                                        )
                                    })
                                )
                            )
                        ),
                    []
                )
            )
                .then(() => console.info(prefix + 'up done') || next())
                .catch(e => console.error(prefix + 'up fail: ' + JSON.stringify(e)) || process.exit(1))
        })
    })


module.exports.down = next => next()
