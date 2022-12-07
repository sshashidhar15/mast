/*global describe, it*/
var assert = require('assert')
var get_current_regulator_name = require('../utils/get_current_regulator_name')

describe(__filename, () => {
  it('should return current regulator asic by res.locals', () => {
    var res = {
      locals: {
        asic: true,
        cysec: false
      }
    }
    assert.equal(
      get_current_regulator_name(res),
      'asic'
    )
  })

  it('should return current regulator cysec by res.locals', () => {
    var res = {
      locals: {
        asic: false,
        cysec: true
      }
    }
    assert.equal(
      get_current_regulator_name(res),
      'cysec'
    )
  })
})
