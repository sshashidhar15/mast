const fs = require('fs')
const path = require('path')

const f = (p, tree = {}) =>
    new Promise((y, n) =>
        fs.readdir(p, {withFileTypes: true}, (e, dirents) =>
            e
                ? n(e)
                : Promise.all(
                    dirents.filter(({name}) => name != 'global-translations.json').map(dirent => {
                        if (dirent.isFile()) {
                            return new Promise((y, n) =>
                                fs.readFile(path.join(p, dirent.name), (e, data) =>
                                    e
                                        ? n(e)
                                        : y([dirent.name.replace(/\.json$/, ''), JSON.parse(data)])
                                )
                            )
                        }
                        tree[dirent.name] = {}
                        return f(p + '/' + dirent.name, tree[dirent.name])
                    })
                ).then(kvs =>
                    y(
                        kvs.reduce(
                            (tree, kv) => {
                                if (kv[0] != undefined) tree[kv[0]] = kv[1]
                                return tree
                            },
                            tree
                        )
                    )
                )
        )
    )


module.exports = p => f(p).then(tree =>
    new Promise((y, n) =>
        fs.readFile(path.join(p, 'global-translations.json'), (e, data) => {
            if (e) return n(e)
            const json = JSON.parse(data)
            y(
                Object.keys(json).reduce(
                    (tree, key) => {
                        tree[key] = json[key]
                        return tree
                    },
                    tree
                )
            )
        })
    )
)
