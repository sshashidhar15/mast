var redis = require('../redis')
var msgpack = require('msgpack-lite')

var add_new_lang_with_en = (regulator, en) => lang =>
  new Promise((y, n) =>
    redis((_, db) =>
      db.hset(redis.CURRENT[regulator], lang, en, e => e ? n(e) : y())))

var del_old_lang = regulator => lang =>
  new Promise((y, n) =>
    redis((_, db) =>
      db.hdel(redis.CURRENT[regulator], lang, e => e ? n(e) : y())))


module.exports = langs => regulator => translations => {
  var actual_langs = Object.keys(translations[0])

  var add = langs.filter(lang => !actual_langs.includes(lang))
  var del = actual_langs.filter(lang => !langs.includes(lang))

  return Promise.all(
    [].concat(
      add.length ? add.map(add_new_lang_with_en(regulator, msgpack.encode(translations[0].en))) : [],
      del.map(del_old_lang(regulator))
    )
  )
    .then(() => translations)
}
