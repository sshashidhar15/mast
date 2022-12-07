const {regulators_prefixes} = require('../config')
const valid_lang = require('./valid_lang')
const prefix_list = Object.values(regulators_prefixes)

module.exports = url => {
    const parts = url.split('/')
    const regulator = parts[1]
    const lang = parts[2]

    if (!prefix_list.includes(regulator)) return null
    if (!valid_lang(lang)) return null

    return parts.length > 4// case /global/en/auditor
        ? prefix_list.includes(parts[3])
            ? parts[3]
            : null
        : parts[3] && prefix_list.includes(parts[3].split('?')[0])
            ? parts[3].split('?')[0]
            : null
}
