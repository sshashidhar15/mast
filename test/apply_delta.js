/*global describe, it*/
var applyDelta = require('../utils/apply_delta');
var assert = require('assert');

describe('applyDelta', () => {
  it('should change path in graph a1.a2 from "fix me" -> "ok"', () => {
    assert.equal(
      applyDelta(
        {
          a1: {
            a2: 'fix me',
            b2: 'ok'
          }
        },
        {
          'a1.a2': 'ok'
        }
      ).a1.a2,
      'ok'
    )
  })

  it('should add new key in case of apply with not existing key', () => {
    let value = 'not existing key'
    assert.equal(
      applyDelta(
        {
          a1: {
            a2: 'fix me',
            b2: 'ok'
          }
        },
        {
          'a1.c2': value
        }
      ).a1.c2,
      value
    )
  })
})
