var redis = require('../redis')
var msgpack = require('msgpack-lite')
const en = 'Raw Pricing Benefits'

module.exports.up = next => {
    console.log('Migration "Raw Pricing Benefits" (for all languages)')
    redis((_, db) =>
        Promise.all(
            ['translation-asic', 'translation-cysec', 'translation-fsa'].map(key =>
                new Promise((y, n) => db.hgetall(key, (e, _) => e ? n(e) : y(_)))
                    .then(_ => {
                        return Object.keys(_).reduce(
                            (_, lang) => {
                                _[lang] = msgpack.decode(_[lang])
                                try {
                                    _[lang]['pages']['index']['home_block3_button'] = en
                                } catch (tce) {
                                    console.error(key, lang, 'no expected key: [pages.index.home_block3_button]', tce.message)
                                }
                                _[lang] = msgpack.encode(_[lang])
                                return _
                            },
                            _
                        )
                    })
                    .then(_ =>
                        new Promise((y, n) => db.hmset(key, _, e => e ? n(e) : y()))
                    )
            )
        )
            .then(() => {
                console.log('Migration "Raw Pricing Benefits" (for all languages) up done')
                next()
            })
            .catch(e => {
                console.error('Migration "Raw Pricing Benefits" (for all languages) up fail' + JSON.stringify(e))
                process.exit(1)
            })
    )
}

module.exports.down = next => next()
