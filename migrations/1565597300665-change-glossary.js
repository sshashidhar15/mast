var redis = require('../redis')
var msgpack = require('msgpack-lite')
var g85 = {
    up: "ECN",
    down: "ECN Broker"
};
var d85 = {
    up: "ECN stands for Electronic Communication Network.",
    down: "Forex ECN brokers provide access to an electronic trading network, supplied with streaming quotes from the top tier banks in the world. By trading through an ECN broker, a currency trader generally benefits from greater price transparency, faster processing, increased liquidity and more availability in the marketplace."
};

['up', 'down'].forEach(direction => {
    module.exports[direction] = next => {
        console.log('Migration edit glossary translation ' + direction)
        redis((_, db) =>
            Promise.all(
                ['translation-asic', 'translation-fsa'].map(key =>
                    new Promise((y, n) => db.hgetall(key, (e, _) => e ? n(e) : y(_)))
                        .then(_ =>
                            Object.keys(_).reduce(
                                (_, lang) => {
                                    _[lang] = msgpack.decode(_[lang])
                                    if (_[lang] && _[lang]['pages'] && _[lang]['pages']['help-resources'] && _[lang]['pages']['help-resources']['forex-glossary'] && _[lang]['pages']['help-resources']['forex-glossary']['g85']) {
                                        _[lang]['pages']['help-resources']['forex-glossary']['g85'] = g85[direction]
                                    } else {
                                        console.error(key, lang, 'not g85')
                                    }
                                    if (_[lang] && _[lang]['pages'] && _[lang]['pages']['help-resources'] && _[lang]['pages']['help-resources']['forex-glossary'] && _[lang]['pages']['help-resources']['forex-glossary']['d85']) {
                                        _[lang]['pages']['help-resources']['forex-glossary']['d85'] = d85[direction]
                                    } else {
                                        console.error(key, lang, 'not d85')
                                    }
                                    _[lang] = msgpack.encode(_[lang])
                                    return _
                                },
                                _
                            )
                        )
                        .then(_ =>
                            new Promise((y, n) => db.hmset(key, _, e => e ? n(e) : y()))
                        )
                )
            )
                .then(() => {
                    console.log('Migration edit glossary translation ' + direction + ' done')
                    next()
                })
                .catch(e => {
                    console.error('Migration edit glossary translation ' + direction + ' fail' + JSON.stringify(e))
                    process.exit(1)
                })
        )
    }
})
