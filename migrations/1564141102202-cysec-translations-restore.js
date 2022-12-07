var { updatedDiff } = require('deep-object-diff')
var msgpack = require('msgpack-lite')
var redis = require('../redis')
,   toFlat = require('../utils/toFlat')
,   applyDelta = require('../utils/apply_delta')

module.exports.up = function (next) {
  console.log('Migration split up: fix cysec translations')
  redis((_, db) =>
    Promise.all(['asic', 'cysec'].map(regulator =>
      new Promise((y, n) => db.hgetall('translation-' + regulator, (err, value) => err ? n(err) : y(value)))
    ))
    .then(([asic, cysec]) => {
      let langs = Object.keys(asic)
      ,   fAsic = msgpack.decode(asic.en)
      ,   fCysec = msgpack.decode(cysec.en)
      ,   diff = toFlat(updatedDiff(fAsic, fCysec))
      ,   dKeys = Object.keys(diff)


      Promise.all(
        langs.filter(l => l !== 'en')
          .map(l => {
            let t = msgpack.decode(asic[l])
            let data = toFlat(t)
            dKeys.map(k => delete data[k])
            return new Promise((y, n) =>
              db.hset('translation-cysec', l, msgpack.encode(applyDelta(t, data)), err =>
                err ? n(err) : y()
              ))
          }))
        .then(() => next())
        .catch(e => console.error('Fix cysec translations failed', e) || process.exit(1))
    })
  )
}

module.exports.down = next => next()
