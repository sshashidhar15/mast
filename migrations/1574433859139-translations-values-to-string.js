const redis = require('../redis')
const msgpack = require('msgpack-lite')
const config = require('../config')
const {regulators} = config
const langs = config.locales.map(_ => _.code)
const prefix = 'deep_replace_non_string_values_from_translations '

function deep_replace_non_string_values_from_translations (tree) {
    Object.keys(tree).forEach(key => {
        if (typeof tree[key] === 'string') return
        if (tree[key] === null) {
            console.info(key + ' was null')
            tree[key] = ''
        }
        if (tree[key] === undefined) {
            console.info(key + ' was undefined')
            tree[key] = ''
        }
        if (typeof tree[key] === 'number') {
            console.info(key + ' was number')
            tree[key] = String(tree[key])
        }
        if (typeof tree[key] === 'object') {
            return deep_replace_non_string_values_from_translations(tree[key])
        }
    })
}

module.exports.up = next =>
    console.info(prefix + 'up') ||
    redis((e, db) => {
        if (e) return console.error(prefix + 'up fail: ' + JSON.stringify(e)) || process.exit(1)
        Promise.all(
            regulators.reduce(
                (acc, regulator) =>
                    acc.concat(
                        langs.map(lang =>
                            new Promise((y, n) =>
                                db.hget(redis.CURRENT[regulator], lang, (e, _) => {
                                    if (e) return n(e)

                                    const translation = msgpack.decode(_)

                                    console.info('=============begin=================')
                                    console.info('============ ' + regulator + ' === ' + lang + ' ===========')
                                    deep_replace_non_string_values_from_translations(translation)
                                    console.info('=============end=================')
                                    db.hset(redis.CURRENT[regulator], lang, msgpack.encode(translation), e =>
                                        e
                                            ? n(e)
                                            : y(console.info(prefix + '' + regulator + ' ' + lang + ' patched'))
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


module.exports.down = next => next()

// MANUAL RUN:
// node migrations/1574433859139-translations-values-to-string.js
//
//module.exports.up()
