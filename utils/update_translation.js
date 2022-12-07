var redis = require('../redis')
var redis_pub = require('../redis_pub')
var applyDelta = require('../utils/apply_delta')
var msgpack = require('msgpack-lite')
var getLocaleData = require('../utils/getLocaleData')
var channels = require('../models/channels')

function updateTranslation(regulator, lang, translations) {
    return new Promise((y, n) =>
        redis((e, db) =>
            e
                ?
                    n(e)
                :
                    getLocaleData(regulator, lang).then(current => {
                        translations.ver = String(1 + Number(current.ver))
                        var applyed_lang = applyDelta(current, translations)
                        if (applyed_lang === undefined) return n(new Error('applyed_lang === undefined'))
                        db.hset(redis.CURRENT[regulator], lang, msgpack.encode(applyed_lang), e =>
                            e
                                ?
                                    n(e)
                                :
                                    redis_pub((e, pub) => {
                                        if (e) {
                                            console.error('Manual redeploy all instances WWW2 is required. Actual translations are in Redis but pub/sub have not notify other instances of WWW2. Redis PUB client failed to connect. ', e)
                                            n(e)
                                        } else {
                                            channels.get_translations_channel(regulator, lang).then(channel =>
                                                pub.publish(
                                                    channel,
                                                    msgpack.encode(translations),
                                                    () => y()
                                                )
                                            )
                                                .catch(n)
                                        }
                                    })
                        )
                    })
        )
    )
}

module.exports = updateTranslation
