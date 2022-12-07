const migrate = require('migrate')
var redis = require('../redis')
var config = require('../config')
var r = require('redis')
var msgpack = require('msgpack-lite')

var is_buffer = ({lastRun, migrations}) =>
  typeof msgpack.decode(lastRun) === 'string' &&
  typeof msgpack.decode(migrations) === 'object'


module.exports = () =>
  new Promise((y, n) =>
    migrate.load(
      {
        stateStore: {
          load: cb =>
            redis((e, db) =>
              e
                ? cb(e)
                : db.hgetall(redis.MIGRATIONS, (e, data) =>
                    e
                      ? cb(e)
                      : data
                        ? is_buffer(data)
                          ? cb(
                              null,
                              {
                                lastRun: msgpack.decode(data.lastRun),
                                migrations: msgpack.decode(data.migrations)
                              }
                            )
                          : (function () {
                              db = r.createClient(config.redis_port, config.redis_host)
                              db.on('error', e => cb(e))
                              db.on('ready', () =>
                                db.hgetall(redis.MIGRATIONS, (e, data) =>
                                  e
                                    ? cb(e)
                                    : typeof data === 'object' && data.lastRun && typeof data.lastRun === 'string' && data.migrations && typeof data.migrations === 'string'
                                      ? db.quit(e =>
                                          e
                                            ? cb(e)
                                            : cb(
                                                null,
                                                {
                                                  lastRun: data.lastRun[0] === '"'
                                                    ? JSON.parse(data.lastRun)
                                                    : data.lastRun,
                                                  migrations: JSON.parse(data.migrations)
                                                }
                                              )
                                        )
                                      : cb(new Error('No valid text state of ' + redis.MIGRATIONS + ' at Redis'))
                                )
                              )
                            }())
                        : cb(null, {})
                  )
            ),
          save: (set, cb) =>
            redis((e, db) =>
              e
                ? cb(e)
                : db.hmset(redis.MIGRATIONS, 'lastRun', msgpack.encode(set.lastRun), 'migrations', msgpack.encode(set.migrations), cb)
            )
        }
      },
      (err, set) =>
        err
          ? n(err)
          : set.up(e => e ? n(e) : y())
    )
  )
