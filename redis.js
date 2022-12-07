const redis = require("redis")
const config = require('./config')
const langs = config.locales.map(_ => _.code)
const default_error = 'Can not connect to ' + config.redis_host + ':' + config.redis_port
const regulators = process.env.IS_CN_HOST === 'true' ? config.regulators_cn : config.regulators
var   client

function init (cb) {
    client = redis.createClient(config.redis_port, config.redis_host, {'return_buffers': true})
    client.on('error', error => cb(error || default_error))
    client.on('ready', () => cb(null, client))
}

module.exports = cb =>
    client
        ? client.closing
            ? init(cb)
            : client.connected
                ? client.ready
                    ? cb(null, client)
                    : client.quit() || init(cb)
                : client.quit
                    ? client.quit() || init(cb)
                    : init(cb)
        : init(cb)

module.exports.SUGGESTION = regulators.reduce(
    (h, regulator) => {
        h[regulator] = 'translation-suggestion-' + regulator
        return h
    },
    {}
)
module.exports.PENDINGS = regulators.reduce(
    (h, regulator) => {
        h[regulator] = langs.reduce((_, lang) => {_[lang] = 'translation-pendings-' + regulator + '-' + lang;return _}, {})
        return h
    },
    {}
)
module.exports.HISTORY = regulators.reduce(
    (h, regulator) => {
        h[regulator] = 'history-' + regulator
        return h
    },
    {}
)
module.exports.CURRENT = regulators.reduce(
    (h, regulator) => {
        h[regulator] = 'translation-' + regulator
        return h
    },
    {}
)
module.exports.FUTURES_INDEX = regulators.reduce(
    (h, regulator) => {
        h[regulator] = 'futures-index-' + regulator
        return h
    },
    {}
)
module.exports.FUTURES_COMMODITY = regulators.reduce(
    (h, regulator) => {
        h[regulator] = 'futures-commodity-' + regulator
        return h
    },
    {}
)
module.exports.FUTURES_BONDS = regulators.reduce(
    (h, regulator) => {
        h[regulator] = 'futures-bonds-' + regulator
        return h
    },
    {}
)
module.exports.FAQ_SECTIONS = regulators.reduce(
    (h, regulator) => {
        h[regulator] = 'faq-sections-' + regulator
        return h
    },
    {}
)
module.exports.LEGAL_DOCUMENTS_VIEW_SCHEMA = regulators.reduce(
    (h, regulator) => {
        h[regulator] = 'legal-documents-view-schema-' + regulator
        return h
    },
    {}
)
module.exports.MIGRATIONS = 'migrations'
module.exports.LEGAL_DOCUMENTS_LINKS = 'LEGAL_DOCUMENTS_LINKS'
module.exports.CHANNELS = 'CHANNELS'
module.exports.ONLINE = 'ONLINE'
module.exports.SESSION_HISTORY = 'SESSION_HISTORY'
