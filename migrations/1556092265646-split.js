var redis = require('../redis')

module.exports.up = function (next) {
  console.log('Migration split up: Redis key translation -> translation-asic & translation-cysec')
  redis((_, db) =>
    db.hgetall('translation', (err, value) =>
      Promise.all(
        ['translation-asic', 'translation-cysec'].map(key =>
          new Promise((y, n) => db.hmset(key, value, err => err ? n(err) : y()))
        ).concat(
          new Promise((y, n) => db.del('translation', err => err ? n(err) : y()))
        )
      )
        .then(() => {
          console.log('Migration split up done')
          next()
        })
        .catch(e => {
          console.error('Migration split up fail' + JSON.stringify(e))
          process.exit(1)
        })
    )
  )
}

module.exports.down = function (next) {
  console.log('Migration split down: Redis key translation-asic -> translation. Delete Redis key translation-cysec')
  redis((_, db) =>
    Promise.all([
      new Promise((y, n) => db.hdel('translation-cysec', err => err ? n(err) : y())),
      new Promise((y, n) => db.hgetall('translation-asic', (err, value) =>
        Promise.all([
          new Promise((y, n) => db.hdel('translation-asic', err => err ? n(err) : y())),
          new Promise((y, n) => db.hmset('translation', value, err => err ? n(err) : y()))
        ])
          .then(() => y())
          .catch(n)
        )
      )
    ])
      .then(() => {
        console.error('Migration split down done')
        next()
      })
      .catch(() => {
        console.error('Migration split down fail')
        process.exit(1)
      })
  )
}
