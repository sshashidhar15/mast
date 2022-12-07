var redis = require('../redis')
var msgpack = require('msgpack-lite')


let replacable = [
  'IC Markets',
  'International Capital Markets Pty Ltd',
  'International Capital Markets',
  'IC Market'
]
,   updated = 'True ECN Trading'
function nameReplace(value) {
  return Object.keys(value).reduce((acc, el) => {
    acc[el] = typeof value[el] === 'string'
      ? replacable.reduce((val, toReplace) => val.replace(new RegExp(toReplace, 'ig'), updated), value[el])
      : nameReplace(value[el])
    return acc
  }, {})
}

module.exports.up = function (next) {
  console.log('Migration split up: clone asic to trueecn')
  redis((_, db) =>
    db.hgetall('translation-asic', (err, value) => {
      let newValue = Object.keys(value).reduce((acc, lang) => {
        acc[lang] = msgpack.encode(nameReplace(msgpack.decode(value[lang])))
        return acc
      }, {})
      db.hmset('translation-fsa', newValue, err => {
        if (err) {
          console.error('Migration split up fail', err)
          return process.exit(1)
        }
        console.log('Migration split up done')
        next()
      })
    })
  )
}

module.exports.down = function (next) {
  console.log('Migration split down: Remove trueecn')
  redis((_, db) =>
    db.hdel('translation-fsa', err => {
      if (err) {
        console.error('Migration split down fail', err)
        return process.exit(1)
      }

      console.error('Migration split down done')
      next()
    })
  )
}
