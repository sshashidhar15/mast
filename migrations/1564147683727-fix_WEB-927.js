var redis = require('../redis')
var msgpack = require('msgpack-lite')

module.exports.up = next => {
    console.log('Migration fix WEB-927 up')
    redis((_, db) =>
        Promise.all(
            ['translation-asic', 'translation-cysec', 'translation-fsa'].map(key =>
                new Promise((y, n) => db.hgetall(key, (e, _) => e ? n(e) : y(_)))
                    .then(_ => {
                        const en = msgpack.decode(_['en'])['pages']['partnerships']['index']['partnership_2']

                        return Object.keys(_).reduce(
                            (_, lang) => {
                                _[lang] = msgpack.decode(_[lang])
                                if (_[lang]['pages']['partnerships']['index']['partnership_2'] !== _[lang]['pages']['partnerships']['introducing-broker']['introducing_broker_3']) {
                                  _[lang]['pages']['partnerships']['index']['partnership_2'] = en
                                  _[lang]['pages']['partnerships']['introducing-broker']['introducing_broker_3'] = en
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
                console.error('Migration fix WEB-927 up done')
                next()
            })
            .catch(e => {
                console.error('Migration fix WEB-927 up fail' + JSON.stringify(e))
                process.exit(1)
            })
    )
}

module.exports.down = next => next()
