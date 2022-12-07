const futures = require('../models/futures')
const prefix = 'Migration init futures '

module.exports.up = next =>
    console.info(prefix + 'up') ||
    futures.create_initial_state_and_save_it_to_db()
        .then(() => console.info(prefix + 'up done') || next())
        .catch(e => console.error(prefix + 'up fail: ' + JSON.stringify(e)) || process.exit(1))


module.exports.down = next => next()
