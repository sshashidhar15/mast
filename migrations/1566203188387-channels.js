var channels = require('../models/channels')
var prefix = 'Migration init channels '


module.exports.up = next =>
  console.info(prefix + 'up') ||
  channels.create_channels_tree()
    .then(() => console.info(prefix + 'up done') || next())
    .catch(e => console.error(prefix + 'up fail: ' + JSON.stringify(e)) || process.exit(1))


module.exports.down = next => next()
