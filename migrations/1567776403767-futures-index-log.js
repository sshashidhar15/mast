const redis = require('../redis')
const msgpack = require('msgpack-lite')
const futures = require('../models/futures')
const prefix = 'Migration futures-index log '
module.exports.up = next =>
    console.info(prefix + 'up') ||
    redis((e, db) => {
        if (e) return console.error(prefix + 'up fail: ' + JSON.stringify(e)) || process.exit(1)
        db.hgetall('FUTURES_INDEX', (e, _) =>
            Promise.all(
                Object.keys(_).map(regulator =>
                    futures.admin_change_index(regulator, msgpack.decode(_[regulator]))
                )
            )
                .then(() => console.info(prefix + 'up done') || next())
                .catch(e => console.error(prefix + 'up fail: ' + JSON.stringify(e)) || process.exit(1))
        )
    })


module.exports.down = next => next()
