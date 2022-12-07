const msgpack = require('msgpack-lite')
const redis = require('../redis')
const config = require('../config')
const langs = config.locales.map(_ => _.code)
const regulators = process.env.IS_CN_HOST === 'true' ? config.regulators_cn : config.regulators

const sections = regulators.reduce(
    (sections, regulator) => {
        sections[regulator] = {}
        return sections
    },
    {}
)

const copy_map = regulator =>
    regulator === 'scb'
        ? 'fsa'
        : regulator

module.exports.load = () =>
    Promise.all(
        regulators.map(regulator =>
            Promise.all(
                langs.map(lang =>
                    new Promise((y, n) => redis((e, db) => e ? n(e) : db.hget(redis.FAQ_SECTIONS[copy_map(regulator)], lang, (e, _) => e ? n(e) : y(_))))
                        .then(_ => sections[regulator][lang] = msgpack.decode(_))
                )
            )
        )
    )

module.exports.get_faq_sections = (regulator, lang) => sections[regulator][lang]
