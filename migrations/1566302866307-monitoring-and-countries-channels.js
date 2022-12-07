const msgpack = require('msgpack-lite')
const redis = require('../redis')
const channels = require('../models/channels')
const prefix = 'Migration add monitoring and countries channels '

module.exports.up = next =>
  console.info(prefix + 'up') ||
  channels.get_channels_tree()
    .then(tree => {
        tree.monitoring = {
            www2: msgpack.encode({
                type: channels.type.monitoring,
                from: 'www2'
            }),
            registration: msgpack.encode({
                type: channels.type.monitoring,
                from: 'registration'
            })
        }
        tree.countries = msgpack.encode({
            type: channels.type.countries
        })
        return tree
    })
    .then(tree =>
        new Promise((y, n) =>
            redis((e, db) =>
                e
                    ?
                        n(e)
                    :
                        db.set(
                            redis.CHANNELS,
                            msgpack.encode(tree),
                            e => e ? n(e) : y()
                        )
            )
        )
    )
    .then(() => console.info(prefix + 'up done') || next())
    .catch(e => console.error(prefix + 'up fail: ' + JSON.stringify(e)) || process.exit(1))


module.exports.down = next => next()
