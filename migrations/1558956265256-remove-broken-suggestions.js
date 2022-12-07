var redis = require('../redis')
var msgpack = require('msgpack-lite')
var broken_buffer_error_code = -17


module.exports.up = next =>
  console.info('Migration remove-broken-suggestions up') || redis((e, db) =>
    db.hgetall(redis.SUGGESTION.asic, (_, suggestions) =>
      Promise.all(
        Object.keys(suggestions)
          .filter(key => msgpack.decode(suggestions[key]) === broken_buffer_error_code)
          .map(key =>
            new Promise((y, n) => db.hdel(redis.SUGGESTION.asic, key, e => e ? n(e) : y()))
          )
      )
        .then(() => console.log('Migration remove-broken-suggestions up done') || next())
        .catch(e => console.error('Migration remove-broken-suggestions up fail: ' + JSON.stringify(e)) || process.exit(1))))

module.exports.down = function (next) {
  next()
}
