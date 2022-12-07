var config = require('../config')
var regulators = process.env.IS_CN_HOST === 'true' ? config.regulators_cn : config.regulators

module.exports = res =>
  Object.keys(res.locals).find(key =>
    regulators.includes(key) && res.locals[key] === true
) || config.default_regulator
