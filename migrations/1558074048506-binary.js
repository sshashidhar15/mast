var redis = require('../redis')
var msgpack = require('msgpack-lite')
var config = require('../config')
var r = require('redis')

var dbs = () => Promise.all([
  new Promise((y, n) => {var db_text = r.createClient(config.redis_port, config.redis_host);db_text.on('ready', e => e ? n(e) : y(db_text))}),
  new Promise((y, n) => redis((e, db_binary) => e ? n(e) : y(db_binary)))
])

module.exports.up = function (next) {
  console.info('Migration binary up: text -> binary')
  dbs().then(([text, binary]) =>
    Promise.all(
      [
        'translation-suggestion-asic',
        'translation-suggestion-cysec',
        'translation-asic',
        'translation-cysec',
        'careers'
      ].map(key =>
        new Promise((y, n) =>
          text.hgetall(key, (e, value) =>
            e
              ? n(e)
              : value === null
                ? y()
                : binary.hmset(
                    key,
                    Object.keys(value).reduce(
                      (acc, key) => {
                        try {
                          acc[key] = msgpack.encode(JSON.parse(acc[key]))
                        } catch (error) {
                          console.error(error)
                        }
                        return acc
                      },
                      value
                    ),
                    e =>
                      e
                        ? n(e)
                        : y())))

      )
    )
      .then(() => console.log('Migration binary up done') || text)
      .catch(e => console.error('Migration binary up fail: ' + JSON.stringify(e)) || process.exit(1))
  )
    .then(db =>
      db.quit(e =>
        e
          ? process.exit(1)
          : next()
      )
    )
}

module.exports.down = function (next) {
  console.error('Migration binary down: binary -> text')
  dbs().then(([text, binary]) =>
    Promise.all(
      [
        'translation-suggestion-asic',
        'translation-suggestion-cysec',
        'translation-asic',
        'translation-cysec',
        'careers'
      ].map(key =>
        new Promise((y, n) =>
          binary.hgetall(key, (e, value) =>
            e
              ? n(e)
              : text.hmset(
                  key,
                  Object.keys(value).reduce(
                    (acc, key) => {
                      try {
                        acc[key] = JSON.stringify(msgpack.decode(acc[key]))
                      } catch (error) {
                        console.error(error)
                      }
                      return acc
                    },
                    value
                  ),
                  e =>
                    e
                      ? n(e)
                      : y()))))

    )
      .then(() => console.error('Migration binary down done') && text)
      .catch(e => console.error('Migration binary down fail: ' + JSON.stringify(e)) || process.exit(1))
  )
    .then(db =>
      db.quit(e =>
        e
          ? process.exit(1)
          : next()
        )
      )
}
