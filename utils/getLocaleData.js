const redis = require('../redis')
,     msgpack = require('msgpack-lite')
,     add_del_keys_from_en = require('./add_del_keys_from_en')

// when no locale is passed to this function, the result (translations) returned from add_del_keys_from_en() would be an array
// the first element of the array is the translations while the second is a boolean indicating if there is any change to the keys (either adding new keys or deleting existing keys) to the codes
module.exports = (regulator, locale) =>
  new Promise((y, n) =>
    redis((e, db) =>
      e
        ? n(e)
        : locale
          ? db.hget(redis.CURRENT[regulator], locale, (e, value) =>
              e
                ? n(e)
                : y(msgpack.decode(value)))
          : add_del_keys_from_en(regulator, db)
              .then(translations => y(translations))
              .catch(n)))
