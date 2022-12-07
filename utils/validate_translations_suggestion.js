module.exports = (translations, etalon) => {
    if (typeof translations !== 'object') return 'translations should be object'
    if (translations === null) return 'translations should not be null'
    if (Object.keys(translations).length === 0) return 'translations should have keys'

    return Object.keys(translations).find(path => {
        if (typeof translations[path] !== 'string') {
            console.error('Validation suggestion: value for a key "' + path + '" should be string')
            return true
        }
        const value_at_etalon = path.split('.').reduce((node, key) => node[key], etalon)
        if (typeof value_at_etalon !== 'string') {
            console.error('Validation suggestion: no key "' + path + '" at etalon')
            return true
        }
        return null
    })
}
