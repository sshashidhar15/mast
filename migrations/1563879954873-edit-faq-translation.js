var redis = require('../redis')
var msgpack = require('msgpack-lite')
var a71 = {
    up: "Slippage is an inherent part of financial markets. Whether you are trading Stocks, Futures, Commodities or Forex you will be subject to slippage. When you place a market order you are requesting your order to be filled at the current markets prices however if the market has moved between the time you place your order and the time it has been filled your order may be filled at a different price. Slippage can increase when markets become volatile such as over new releases, you should keep this in mind when trading outside of normal market conditions.<br><br>Stop Loss orders when triggered enter the market as market orders, therefore their is no guarantee that your order will be filled at the price you place your stop loss.",
    down: "Slippage is an inherent part of financial markets. Whether you are trading Stocks, Futures, Commodities or Forex you will be subject to slippage. When you place a market order you are requesting your order to be filled at the currency market price however if the market has moved between the time you place your order and the time it has been filled your order may be filled at a different price. Slippage can increase when markets become volatile such as over new periods, you should keep this in mind when trading outside of normal market conditions.<br><br>Stop Loss orders when triggered enter the market as market orders, therefore their is no guarantee that your order will be filled at the price you place your stop loss."
};

['up', 'down'].forEach(direction => {
module.exports[direction] = next => {
    console.log('Migration edit faq translation ' + direction)
    redis((_, db) =>
        Promise.all(
            ['translation-asic', 'translation-fsa'].map(key =>
                new Promise((y, n) => db.hgetall(key, (e, _) => e ? n(e) : y(_)))
                    .then(_ =>
                        Object.keys(_).reduce(
                            (_, lang) => {
                                _[lang] = msgpack.decode(_[lang])
                                _[lang]['pages']['help-resources']['help-center']['a71'] = a71[direction]
                                _[lang] = msgpack.encode(_[lang])
                                return _
                            },
                            _
                        )
                    )
                    .then(_ =>
                        new Promise((y, n) => db.hmset(key, _, e => e ? n(e) : y()))
                    )
            )
        )
            .then(() => {
                console.log('Migration edit faq translation ' + direction + ' done')
                next()
            })
            .catch(e => {
                console.error('Migration edit faq translation ' + direction + ' fail' + JSON.stringify(e))
                process.exit(1)
            })
    )
}
})
