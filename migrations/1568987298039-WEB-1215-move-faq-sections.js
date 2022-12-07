const redis = require('../redis')
const config = require('../config')
const langs = config.locales.map(_ => _.code)
const msgpack = require('msgpack-lite')
const prefix = 'Migration faq-sections '

const create_interval = (from, to, i) => from > to ? i : create_interval(from + 1, to, i.concat(from))
const i = (from, to) => create_interval(from, to, [])
const seed = {
    asic: msgpack.encode([
        ['faq_section_1', [].concat(i(0, 3), i(224, 228))],//Questions about IC Markets
        ['faq_section_2', [].concat(i(4, 17), i(19, 26), i(131, 166))],//Questions about Trading with IC Markets
        ['faq_section_3', i(27, 37)],//Questions about the Forex Market
        ['faq_section_4', i(38, 45)],//Understanding MetaTrader 4 problems
        ['faq_section_10', i(167, 209)],//Understanding platforms
        ['faq_section_5', [].concat(i(46, 74), i(210, 223))],//Questions about Trading Forex Online
        ['faq_section_6', i(75, 79)],//Questions about trading CFDs Online
        ['faq_section_7', i(80, 99)],//Account Application
        ['faq_section_8', i(100, 130)],//Client Area
    ]),
    cysec: msgpack.encode([
        ['faq_section_1', i(0, 7)]
    ]),
    fsa: msgpack.encode([
        ['faq_section_1', [].concat(i(0, 3), i(224, 228))],//Questions about IC Markets
        ['faq_section_2', [].concat(i(4, 17), i(19, 26), i(131, 166))],//Questions about Trading with IC Markets
        ['faq_section_3', i(27, 37)],//Questions about the Forex Market
        ['faq_section_4', i(38, 45)],//Understanding MetaTrader 4 problems
        ['faq_section_10', i(167, 209)],//Understanding platforms
        ['faq_section_5', [].concat(i(46, 74), i(210, 223))],//Questions about Trading Forex Online
        ['faq_section_6', i(75, 79)],//Questions about trading CFDs Online
        ['faq_section_7', i(80, 99)],//Account Application
        ['faq_section_8', i(100, 130)],//Client Area
    ])
}
const regulators = Object.keys(seed)

module.exports.up = next =>
    console.info(prefix + 'up') ||
    redis((e, db) =>
        Promise.all(
            regulators.map(regulator =>
                Promise.all(
                    langs.map(lang =>
                        new Promise((y, n) => db.hset(redis.FAQ_SECTIONS[regulator], lang, seed[regulator], e => e ? n(e) : y()))
                    )
                )
            )
        )
            .then(() => console.info(prefix + 'up done') || next())
            .catch(e => console.error(prefix + 'up fail: ' + JSON.stringify(e)) || process.exit(1))
    )


module.exports.down = next => next()
//module.exports.up(() => console.log('done'))
