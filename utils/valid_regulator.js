const {regulator_prefix_by_branch_wcf_id} = require('../config')

module.exports = id => regulator_prefix_by_branch_wcf_id.hasOwnProperty(id)
