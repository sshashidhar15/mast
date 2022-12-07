const redis = require('../redis')
const msgpack = require('msgpack-lite')
const prefix = 'Migration WEB-1201 ICMarkets -> ICMarkets (SC) for FSA '

function deep_replace (tree, path, paths_to_updated_keys) {
    return Object.keys(tree).reduce(
        (paths_to_updated_keys, key) => {
            if (typeof tree[key] === 'string') {
                if (tree[key].indexOf('IC Markets') !== -1) {
                    tree[key] = tree[key].replace(/IC Markets/gi, 'IC Markets (SC)')
                    if (tree[key].indexOf('(SC) (SC)') !== -1) {
                        tree[key] = tree[key].replace(/(SC) (SC)/gi, '(SC)')
                    }
                    paths_to_updated_keys.push(path.concat(key))
                }
                return paths_to_updated_keys
            }
            return deep_replace(tree[key], path.concat(key), paths_to_updated_keys)
        },
        paths_to_updated_keys
    )
}

module.exports.up = next => {
    console.info(prefix + 'up')
    redis((_, db) =>
        Promise.all([
            new Promise((y, n) => db.hgetall(redis.CURRENT.asic, (e, _) => e ? n(e) : y(_))),
            new Promise((y, n) => db.hgetall(redis.CURRENT.fsa, (e, _) => e ? n(e) : y(_)))
        ])
            .then(([asic, fsa]) => {
                if (String(Object.keys(asic).sort()) !== String(Object.keys(fsa).sort())) return Promise.reject(new Error('langs not same between asic & fsa'))
                const langs = Object.keys(asic)
                langs.forEach(lang => {
                    asic[lang] = msgpack.decode(asic[lang])
                    fsa[lang] = msgpack.decode(fsa[lang])
                    const paths_to_updated_keys = deep_replace(asic[lang], [], [])
                    console.info(prefix + '... lang: ' + lang + ' replaces: ' + paths_to_updated_keys.length)
                    paths_to_updated_keys.forEach(path => {
                        const k = path[path.length - 1]
                        const short_path = [].concat(path).filter((_, i) => i < path.length - 1)
                        const asic_value = path.reduce((tree, key) => tree[key], asic[lang])

                        short_path.reduce((tree, key) => tree[key], fsa[lang])[k] = asic_value
                    })
                    asic[lang] = msgpack.encode(asic[lang])
                    fsa[lang] = msgpack.encode(fsa[lang])
                })
                return fsa
            })
            .then(fsa =>
                new Promise((y, n) => db.hmset(redis.CURRENT.fsa, fsa, e => e ? n(e) : y()))
            )
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
