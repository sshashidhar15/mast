/*global describe xdescribe it*/
const assert = require('assert')
const get_hack_ads_prefix = require('../utils/get_hack_ads_prefix')

xdescribe(__filename, () => {
    it('"icmarkets.com" should return null', () =>
        assert.equal(
            get_hack_ads_prefix(''),
            null
        )
    )
    describe('pattern /regulator/lang/regulator?camp=2222222', () => {
        it('eu', () =>
            assert.equal(
                get_hack_ads_prefix('/sc/en/eu?camp=2222222'),
                'eu'
            )
        )
        it('au', () =>
            assert.equal(
                get_hack_ads_prefix('/sc/en/au?camp=2222222'),
                'au'
            )
        )
        it('sc', () =>
            assert.equal(
                get_hack_ads_prefix('/sc/en/sc?camp=2222222'),
                'sc'
            )
        )
    })
    describe('pattern /regulator/lang/regulator', () => {
        it('eu', () =>
            assert.equal(
                get_hack_ads_prefix('/sc/en/eu'),
                'eu'
            )
        )
        it('au', () =>
            assert.equal(
                get_hack_ads_prefix('/sc/en/au'),
                'au'
            )
        )
        it('sc', () =>
            assert.equal(
                get_hack_ads_prefix('/sc/en/sc'),
                'sc'
            )
        )
    })
    describe('pattern /regulator/lang/regulator/', () => {
        it('eu', () =>
            assert.equal(
                get_hack_ads_prefix('/sc/en/eu/'),
                'eu'
            )
        )
        it('au', () =>
            assert.equal(
                get_hack_ads_prefix('/sc/en/au/'),
                'au'
            )
        )
        it('sc', () =>
            assert.equal(
                get_hack_ads_prefix('/sc/en/sc/'),
                'sc'
            )
        )
    })
    describe('if some of our routes starts from one of our prefixes it should return null', () => {
        it('eu', () =>
            assert.equal(
                get_hack_ads_prefix('/sc/en/europe'),
                null
            )
        )
        it('au', () =>
            assert.equal(
                get_hack_ads_prefix('/sc/en/audit'),
                null
            )
        )
        it('sc', () =>
            assert.equal(
                get_hack_ads_prefix('/sc/en/score'),
                null
            )
        )
    })
    describe('in pattern /regulator/lang/regulator lang should be valid', () => {
        it('eu', () =>
            assert.equal(
                get_hack_ads_prefix('/sc/xx/eu'),
                null
            )
        )
        it('au', () =>
            assert.equal(
                get_hack_ads_prefix('/sc/xx/au'),
                null
            )
        )
        it('sc', () =>
            assert.equal(
                get_hack_ads_prefix('/sc/xx/sc'),
                null
            )
        )
    })
    describe('in pattern /regulator/lang/regulator 1st regulator should be valid', () => {
        it('eu', () =>
            assert.equal(
                get_hack_ads_prefix('/xx/en/eu'),
                null
            )
        )
        it('au', () =>
            assert.equal(
                get_hack_ads_prefix('/xx/en/au'),
                null
            )
        )
        it('sc', () =>
            assert.equal(
                get_hack_ads_prefix('/xx/en/sc'),
                null
            )
        )
    })
})
