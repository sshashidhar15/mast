var model = {
  schema: require('../models/legal_documents_view_schema'),
  list: require('../models/legal_documents_links')
}
var prefix = 'Migration legal-documents WEB-1152 '
var link = 'https://cdn.icmarkets.eu/REFUND+AND+CANCELLATION+POLICY.pdf'
var schema = {
  up: [0, 1, 2, 3, 4, 5, 6, 28, 7, 8, 9, 10, 11, 12, 16, [13, 14, 15], 17, 18, 19, 20, 21, /*22, 23, */25, 26, 27],
  down: [0, 1, 2, 3, 4, 5, 6, 28, 7, 8, 9, 10, 11, 12, 16, [13, 14, 15], 17, 18, 19, 20, 21, /*22, 23, */24, 25, 26, 27]
}


module.exports.up = next =>
  console.info(prefix + 'up') ||
  model.schema.update(schema.up)
    .then(() => console.info(prefix + 'up done') || next())
    .catch(e => console.error(prefix + 'up fail: ' + JSON.stringify(e)) || process.exit(1))

module.exports.down = next =>
  console.info(prefix + 'down') ||
  Promise.all([
    model.schema.update(schema.down),
    model.list.delete(link)
  ])
    .then(() => console.info(prefix + 'down done') || next())
    .catch(e => console.error(prefix + 'down fail: ' + JSON.stringify(e)) || process.exit(1))
