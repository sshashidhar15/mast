const msgpack = require('msgpack-lite')
const path =  require('path')
const parse_files_tree = require('../utils/parse_files_tree')
const find_new_keys = require('../utils/find_new_keys')
const redis = require('../redis')
const langs = require('../config').locales.map(locale => locale.code)

const apply_add = add => (translation, _locale) =>
    add.reduce(
        (translation, path) => {
            const key = path.pop()
            var value = path.concat(key).reduce((node, key) => node[key], _locale)
            path.reduce(
                (node, key) => {
                    node[key] = node[key] || {}
                    return node[key]
                },
                translation
            )[key] = value
            return translation
        },
        translation
    )

const apply_del = del => translation =>
    del.reduce(
        (translation, path) => {
            const key = path.pop()
            delete path.reduce((node, key) => node[key], translation)[key]
            return translation
        },
        translation
    )

var etalon_cache = null
function load_etalon_once_with_cache () {
    if (etalon_cache) return Promise.resolve(etalon_cache)
    return parse_files_tree(path.join(__dirname, '../_locale/en'))
        .then(etalon => {
            etalon_cache = etalon
            return etalon
        })
}

let new_keys_added = false

const add_del_keys_from_en_by_regulator = (regulator, db) =>
    Promise.all([
        load_etalon_once_with_cache(),
        new Promise((y, n) => db.hgetall(redis.CURRENT[regulator], (e, _) => e ? n(e) : y(Object.keys(_ || {}).reduce(
            (acc, lang) => {
                acc[lang] = msgpack.decode(_[lang])
                return acc
            },
            {}
        ))))
    ])
        .then(([_locale, remote]) => {
            remote = langs.reduce(
                (remote, lang) => {
                    const add = find_new_keys( _locale, remote[lang], [], [])
                    const del = find_new_keys( remote[lang] || {}, _locale, [], [])

                    if (add.length === 0 && del.length === 0) {
                        new_keys_added = false
                        return remote
                    }

                    new_keys_added = true
                    remote[lang] = [
                        apply_add(JSON.parse(JSON.stringify(add))),
                        apply_del(JSON.parse(JSON.stringify(del)))
                    ].reduce(
                        (translation, reducer) => reducer(translation, _locale),
                        remote[lang] || {}
                    )
                    remote[lang].ver = String(1 + Number(remote[lang].ver))
                    return remote
                },
                remote
            )

            return new Promise((y, n) => {
                db.hmset(
                    redis.CURRENT[regulator],
                    langs.reduce(
                        (_, lang) => {
                            _[lang] = msgpack.encode(remote[lang])
                            return _
                        },
                        {}
                    ),
                    e => e ? n(e) : y([remote, new_keys_added])
                )
            }
            )
        })

module.exports = add_del_keys_from_en_by_regulator
