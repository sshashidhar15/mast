const redis = require('../redis')
const {regulators} = require('../config')
const legal_documents_links_list = require('../models/legal_documents_links')
const legal_documents_view_schema = require('../models/legal_documents_view_schema')
const prefix = 'Legal documents view schema spliting by regulators '
const new_item = {
  id: 29,
  link: 'https://cdn.icmarkets.eu/RTS27_Q2_2019.xlsx'
}
module.exports.up = next =>
    console.info(prefix + 'up') ||
    redis((e, db) => {
        if (e) return console.error(prefix + 'up fail: ' + JSON.stringify(e)) || process.exit(1)
        db.get('LEGAL_DOCUMENTS_VIEW_SCHEMA', (e, _) =>
            Promise.all(
                regulators.map(regulator =>
                    new Promise((y, n) => db.set(redis.LEGAL_DOCUMENTS_VIEW_SCHEMA[regulator], _, e => e ? n(e) : y()))
                )
            )
                .then(() => legal_documents_links_list.create(new_item.link))
                .then(() =>
                    legal_documents_view_schema.read('cysec').then(schema =>
                        legal_documents_view_schema.update('cysec', schema.concat(new_item.id))
                    )
                )
                .then(() => console.info(prefix + 'up done') || next())
                .catch(e => console.error(prefix + 'up fail: ' + JSON.stringify(e)) || process.exit(1))
        )
    })


module.exports.down = next => next()
