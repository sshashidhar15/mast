var redis = require('../redis')

redis((_, db) => db.del(redis.MIGRATIONS, (err, response) =>
    process.exit(console.log(
      response == 1
        ? ['Successful deleted', redis.MIGRATIONS, 'from Redis'].join(' ')
        : ['FAIL delete', redis.MIGRATIONS, 'from Redis (or it is already empty) '].join(' ')) || 0)))
