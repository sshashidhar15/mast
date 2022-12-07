/*global describe, it*/
var assert = require('assert')
var find_new_and_updated_keys = require('../utils/find_new_and_updated_keys')

describe('find_new_keys', () => {
    it('should return all root keys if second tree is empty {}', () => {
        assert.deepEqual(
            find_new_and_updated_keys(
                {
                    a1: {
                        a2: {
                            a3: 'value_a1.a2.a3',
                            b3: 'value_a1.a2.b3'
                        }
                    },
                    b1: {
                        a2: {
                            a3: 'value_b1.a2.a3',
                            b3: 'value_b1.a2.b3'
                        }
                    }
                },
                {},
                [],
                []
            ),
            [
                ['a1'],
                ['b1']
            ]
        )
    })
    it('should return collection of paths to new keys in translation tree', () => {
        assert.deepEqual(
            find_new_and_updated_keys(
                {
                    a1: {
                        a2: {
                            a3: 'value_a1.a2.a3',
                            b3: 'value_a1.a2.b3'
                        }
                    },
                    b1: {
                        a2: {
                            a3: 'value_b1.a2.a3',
                            b3: 'value_b1.a2.b3'
                        }
                    }
                },
                {
                    a1: {
                        a2: {
                            a3: 'value_a1.a2.a3____HERE_UPDATE____'
                        }
                    },
                    b1: {
                        a2: {
                            a3: 'value_b1.a2.a3'
                        }
                    }
                },
                [],
                []
            ),
            [
                ['a1', 'a2', 'a3'],
                ['a1', 'a2', 'b3'],
                ['b1', 'a2', 'b3']
            ]
        )
    })
})
