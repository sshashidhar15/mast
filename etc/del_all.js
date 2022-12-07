var redis = require('../redis')

redis((_, db) => db.flushdb((err, ok) => {
  console.log('flushdb', err, ok)
  process.exit()
}))
