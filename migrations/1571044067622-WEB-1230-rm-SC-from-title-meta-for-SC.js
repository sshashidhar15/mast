const redis = require('../redis')
const msgpack = require('msgpack-lite')
const prefix = 'Migration WEB-1230 Remove (SC) from title and meta for ALL pages in /SC '

function deep_replace (tree) {
    return Object.keys(tree).reduce(
        (_, key) => {
            if (typeof tree[key] === 'string') {
                if (key === 'title' || key === 'meta') {
                    tree[key] = tree[key].replace(/\s+\(SC\)/gi, '').replace(/\(SC\)/gi, '')
                }
                return null
            }
            return deep_replace(tree[key])
        },
        null
    )
}

module.exports.up = next => {
    console.info(prefix + 'up')
    redis((_, db) =>
        new Promise((y, n) => db.hgetall(redis.CURRENT.fsa, (e, _) => e ? n(e) : y(_)))
            .then(fsa => {
                const langs = Object.keys(fsa)
                langs.forEach(lang => {
                    fsa[lang] = msgpack.decode(fsa[lang])
                    deep_replace(fsa[lang])
                    fsa[lang] = msgpack.encode(fsa[lang])
                    console.info(prefix + '... lang: ' + lang)
                })
                return fsa
            })
            .then(fsa => {
                console.info(prefix + 'save FSA translations patch to Redis!')
                return new Promise((y, n) => db.hmset(redis.CURRENT.fsa, fsa, e => e ? n(e) : y()))
            })
            .then(() => {
                console.info(prefix + ' up done')
                next()
            })
            .catch(e => {
                console.error(prefix + ' up fail with error: ' + JSON.stringify(e))
                process.exit(1)
            })
    )
}

module.exports.down = next => next()
