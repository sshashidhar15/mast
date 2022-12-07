var redis = require('../redis')
var words_count = require('../utils/words_count')
var lang = process.argv[2] || 'en'
var but = process.argv[3] ?
  ? key => key === process.argv[3]
  : () => null

redis((_, db) =>
  Promise.all(
    Object.keys(redis.CURRENT).map(regulator =>
      new Promise((y, n) =>
        db.hget(redis.CURRENT[regulator], lang, (err, value) =>
          console.log(err || [regulator, lang, words_count(JSON.parse(value), 0, but)].join(' '))
        )
      )
    )
  )
    .then(() => db.quit())
    .catch(() => db.quit())
)
