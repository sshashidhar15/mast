var model = require('../models/legal_documents_view_schema')
var prefix = 'Migration legal-documents-view-schema '
var init_view_schema = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 16, [13, 14, 15], 17, 18, 19, 20, 21, /*22, 23, */24, 25, 26, 27]


module.exports.up = next =>
  console.info(prefix + 'up') ||
  model.create(init_view_schema)
    .then(() => console.info(prefix + 'up done') || next())
    .catch(e => console.error(prefix + 'up fail: ' + JSON.stringify(e)) || process.exit(1))


module.exports.down = next =>
  console.info(prefix + 'down') ||
  model.delete()
    .then(() => console.info(prefix + 'down done') || next())
    .catch(e => console.error(prefix + 'down fail: ' + JSON.stringify(e)) || process.exit(1))
