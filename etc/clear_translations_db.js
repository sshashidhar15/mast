var redis = require('../redis')
var config = require('../config')
var select_regulator = require('../utils/select_regulator')
var regulators = process.env.IS_CN_HOST === 'true' ? config.regulators_cn : config.regulators

select_regulator(answers => {
  var regulator = regulators.find(key =>
    regulators[key] === answers.regulator
  )
  redis((_, db) => db.del(redis.SUGGESTION[regulator], (err, response) =>
    process.exit(console.log(
      response == 1
        ? ['Successful deleted', redis.SUGGESTION[regulator], 'from Redis'].join(' ')
        : ['FAIL delete', redis.SUGGESTION[regulator], 'from Redis (or it is already empty) '].join(' ')) || 0)))
})
