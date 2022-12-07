const redis = require('../redis')
const prefix = 'test-console-log in migration'

module.exports.up = next =>
    console.info(prefix + 'up') ||
    redis(error =>
        error
            ? console.error(prefix, 'up fail ', error) || process.exit(1)
            : console.log(prefix, 'up done') || next()
    )

module.exports.down = next => next()
