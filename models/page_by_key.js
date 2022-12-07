const fs = require('fs')
const glob = require('glob')
const msgpack = require('msgpack-lite')

function find_keys (t, i = 0, r = []) {
    if (~i && i < t.length) {
        var s = t.indexOf('$t(', i)
        var e = t.indexOf(')', s)
        var z = t.indexOf(',', s)
        return ~s && ~e
            ? find_keys(t, e, r.concat(t.substring(s + 3, ~z && z < e ? z : e).replace(/["']/g, '')))
            : r
    }
    return r
}

var cache

module.exports.load = () =>
    glob('views/**/*.ejs', {}, (e, f) =>
        e
            ? process.exit(console.log(e))
            : Promise.all(f.map(fn =>
                new Promise((y, n) =>
                    fs.readFile(fn, 'utf8', (e, template) =>
                        e
                            ? n(e)
                            : y([fn, find_keys(template)])
                    )
                )
            )).then(a => a.reduce(
                (m, _) =>
                    _[1].reduce(
                        (m , key) => {
                            m[key] = m[key] || []
                            var fn = _[0].replace(/\.ejs$/, '')
                            fn = fn.split('/')
                            fn.shift()
                            fn = fn.join('/')
                            if (!m[key].includes(fn)) m[key].push(fn)
                            return m
                        },
                        m
                    ),
                {}
            )).then(m => cache = msgpack.encode(m))
    )
module.exports.get = () => cache
