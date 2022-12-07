var redis = require('../redis')
var fetch = require('node-fetch')
var config = require('../config')
var msgpack = require('msgpack-lite')
var find_new_and_updated_keys = require('../utils/find_new_and_updated_keys')
var select_regulator = require('../utils/select_regulator')
var find_new_keys = require('../utils/find_new_keys')
var readline = require('readline')
var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})
var prod_color = "\x1b[34m"
var red_color = "\x1b[31m"
var local_color = red_color
var reset_color = "\x1b[0m"
var white_color = "\x1b[37m"
var green_color = "\x1b[32m"

var zone_by_regulator = {
  asic: 'com',
  cysec: 'eu'
}

var regulators = process.env.IS_CN_HOST === 'true' ? config.regulators_cn : config.regulators

select_regulator(answers => {
  var regulator = regulators.find(key =>
    regulators[key] === answers.regulator
  )

console.log('Loading translations by ' + regulator + ' from https://icmarkets.' + zone_by_regulator[regulator] + '/admin/CURRENT...\n')
Promise.all([
  fetch(
      config.auth_service_url + '/manager/auth',
      {
          method: 'POST',
          body: msgpack.encode({
            login: 'p.tanilian',
            password: 'test123'
          })
      }
  )
    .then(_ => _.ok ? _.buffer() : Promise.reject(new Error(_.status)))
    .then(_ => msgpack.decode(_).token),
  new Promise((y, n) => redis((e, db) => e ? n(e) : y(db)))
])
  .then(([token, db]) =>
    Promise.all([
      fetch(
        'https://icmarkets.' + zone_by_regulator[regulator] + '/admin/CURRENT',
        {
          method: 'GET',
          headers: {
            Cookie: `manager_token=${token}`
          }
        }
      )
        .then(res => res.ok && res.json()),
      new Promise(y =>
        db.hgetall(redis.CURRENT[regulator], (e, _) => {
          return e || _ == null || typeof _ !== 'object'
            ? y({})
            : y(Object.keys(_ || {}).reduce((_, lang) => {_[lang] = JSON.parse(_[lang]); return _}, _))
        })
      )
    ])
      .then(([prod, local]) => {
        var add_and_update = find_new_and_updated_keys(prod, local, [], [])
        var del = []//find_new_keys(local, prod, [], [])

        if (add_and_update.length === 0 && del.length === 0) {
          console.log(green_color, 'Equal')
          db.quit(() => process.exit())
          return
        }

        console.log(reset_color, 'Diff:\n')
        add_and_update.forEach(path => {
          var prod_value  = path.reduce((_, key) => _[key], prod || {})
          var local_value = path.reduce((_, key) => _[key], local || {})
          var key = path.join('.')

          console.log(reset_color, local_value ? '!' : '+', '\t', key)
          if (local_value !== undefined)
            console.log(prod_color , '\t', prod_value) ||
            console.log(local_color, '\t', local_value)
        })
        if (del.length) console.log(red_color , '\nWill loose keys:')
        del.forEach(path => {
          var key = path.join('.')
          console.log(reset_color, '-', '\t', key)
        })

        console.log(reset_color, '\nLegend:')
        console.log(prod_color, 'https://icmarkets.com')
        console.log(local_color, config.redis_host)
        console.log(white_color)

        //rl.question('Save? (Y/n):', yn => {
          //if (yn === 'n') return db.quit(() => process.exit())
          console.log(reset_color, 'Saving...')
          Promise.all(
            Object.keys(prod).map(lang =>
              new Promise((y, n) => db.hset(redis.CURRENT[regulator], lang, JSON.stringify(prod[lang]), e => e ? n(e) : console.log(green_color, 'saved', lang) || y()))
            )
          )
            .then(() =>
              console.log(green_color, 'All Done.') || db.quit(() => process.exit()))
            .catch(error =>
              console.log(red_color, error) || db.quit(() => process.exit()))
        //})
      })
  )
})
