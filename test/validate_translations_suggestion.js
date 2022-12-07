/*global describe it before after*/
const assert = require('assert')
const redis = require('../redis')
const validate_translations_suggestion = require('../utils/validate_translations_suggestion')
const getLocaleData = require('../utils/getLocaleData')

describe('Delta changes from translator should be validated at server side before adding it to Redis hash SUGGESTION', () => {
    var etalon
    before(function (done) {
        this.timeout(1112312)
        getLocaleData('fsa', 'en').then(_ => {
            etalon = _
            done()
        })
    })

    it('flat object should be valid', () =>
        assert.equal(
            validate_translations_suggestion({'pages.index.title': 'it is ok'}, etalon),
            undefined
        )
    )

    it('non-existed key at _locale (*.json) should be returned to found invalid key at suggestion', () =>
        assert.equal(
            validate_translations_suggestion(
                {
                    'pages.index.title': 'it is ok',
                    'pages.index.NO_SUCH_KEY_AT_INDEX_JS_FILE': 'it is not ok'
                },
                etalon
            ),
            'pages.index.NO_SUCH_KEY_AT_INDEX_JS_FILE'
        )
    )

    it('deep object should be invalid and return invalid key "pages" which does not have string value', () =>
        assert.equal(
            validate_translations_suggestion({'pages': {'index': {'title': 'it is not ok'}}}, etalon),
            'pages'
        )
    )

    it('null should be invalid', () =>
        assert.equal(
            validate_translations_suggestion(null, etalon),
            'translations should not be null'
        )
    )

    it('string should be invalid', () =>
        assert.equal(
            validate_translations_suggestion('some_string', etalon),
            'translations should be object'
        )
    )

    it('array should be invalid', () =>
        assert.equal(
            validate_translations_suggestion([1, 2, 3], etalon),
            false
        )
    )

    it('number should be invalid', () =>
        assert.equal(
            validate_translations_suggestion(123, etalon),
            'translations should be object'
        )
    )

    after(done =>
        redis((e, db) =>
            e
                ? done(e)
                : db.quit(e =>
                    e
                        ? done(e)
                        : done()
                )
        )
    )

})
