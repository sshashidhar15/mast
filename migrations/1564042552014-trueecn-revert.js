var redis = require('../redis')
var msgpack = require('msgpack-lite')


let replacable = [
  'True ECN Trading'
]
,   updated = 'IC Markets (SC)'
function nameReplace(value) {
  return Object.keys(value).reduce((acc, el) => {
    acc[el] = typeof value[el] === 'string'
      ? replacable.reduce((val, toReplace) => val.replace(new RegExp(toReplace, 'ig'), updated), value[el])
      : nameReplace(value[el])
    return acc
  }, {})
}

module.exports.up = function (next) {
  console.log('Migration split up: replace trueecn with icm sc')
  redis((_, db) =>
    db.hgetall('translation-fsa', (err, value) => {
      let newValue = Object.keys(value).reduce((acc, lang) => {
        acc[lang] = msgpack.encode(nameReplace(msgpack.decode(value[lang])))
        return acc
      }, {})
      db.hmset('translation-fsa', newValue, err => {
        if (err) {
          console.error('Migration trueecn2icmsc failed' + JSON.stringify(err))
          return process.exit(1)
        }
        console.error('Migration trueecn2icmsc done')
        next()
      })
    })
  )
}

module.exports.down = next => next()
