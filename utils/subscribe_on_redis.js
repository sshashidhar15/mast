var published_pub_sub_ready_message_should_recived_before_start_loading_state
const timeout = 15000
const redis_sub = require('../redis_sub')
const redis_pub = require('../redis_pub')
const msgpack = require('msgpack-lite')
const pending_deltas = require('../models/pending_deltas')
const futures = require('../models/futures')
const channels = require('../models/channels')
const registration = require('../models/registration')
const translation = require('../models/translation')
const online = require('../models/online')

function on_translations (channel, message) {
    const {regulator, lang} = msgpack.decode(channel)
    const delta = msgpack.decode(message)
    pending_deltas[regulator].insert({
        lang,
        delta
    })
}

function on_history_channel (channel, message) {
    const {regulator} = msgpack.decode(channel)
    translation.on_history(regulator, message)
}

function on_pending_set_channel (channel, message) {
    const {regulator} = msgpack.decode(channel)
    translation.on_pending_set(regulator, message)
}

function on_pending_del_channel (channel, message) {
    const {regulator} = msgpack.decode(channel)
    translation.on_pending_del(regulator, message)
}

function on_futures_index (channel, message) {
    const {regulator} = msgpack.decode(channel)
    futures.update_index_from_redis_pub_sub(regulator, msgpack.decode(message))
}

function on_futures_commodity (channel, message) {
    const {regulator} = msgpack.decode(channel)
    futures.update_commodity_from_redis_pub_sub(regulator, msgpack.decode(message))
}

function on_futures_bonds (channel, message) {
    const {regulator} = msgpack.decode(channel)
    futures.update_bonds_from_redis_pub_sub(regulator, msgpack.decode(message))
}

function on_countries_channel (channel, message) {
    registration.update_countries(msgpack.decode(message))
}

function on_online_channel (channel, message) {
    online.on_sessions(message)
}

function on_pub_sub_ready (channel, message, ready_message, cb) {
    if (msgpack.decode(message) === ready_message) {
        clearTimeout(published_pub_sub_ready_message_should_recived_before_start_loading_state)
        return cb()
    }
}

function on_unsupported_channel (channel, message) {
    return Promise.reject(
        new Error([
            'Got message from unsupported channel!',
            'Channel:',
            typeof channel === 'string'
                ?
                    channel
                :
                    JSON.stringify(
                        Buffer.isBuffer(channel)
                            ?
                                msgpack.decode(channel)
                            :
                                channel
                    ),
            'Message:',
            typeof message === 'string'
                ?
                    message
                :
                    JSON.stringify(
                        Buffer.isBuffer(message)
                            ?
                                msgpack.decode(message)
                            :
                                message
                    )
        ].join('\n'))
    )
}

module.exports = () => new Promise((y, n) => redis_sub((e, sub) => {
    if (e) return n(e)
    const ready_message = Math.random() + Date.now()
    sub.on('message', (channel, message) =>
        console.info('Redis onmessage channel:', msgpack.decode(channel), '...please wait a bit for locales ready') ||
        channels.is_translations_channel(channel).then(yes =>
            yes
                ?
                    on_translations(channel, message)
                :
                    channels.is_futures_index_channel(channel).then(yes =>
                        yes
                            ?
                                on_futures_index(channel, message)
                            :
                                channels.is_futures_bonds_channel(channel).then(yes =>
                                    yes
                                        ?
                                            on_futures_bonds(channel, message)
                                        :
                                            channels.is_futures_commodity_channel(channel).then(yes =>
                                                yes
                                                    ?
                                                        on_futures_commodity(channel, message)
                                                    :
                                                        channels.is_pub_sub_ready_channel(channel).then(yes =>
                                                            yes
                                                                ?
                                                                    on_pub_sub_ready(channel, message, ready_message, y)
                                                                :
                                                                    channels.is_countries_channel(channel).then(yes =>
                                                                        yes
                                                                            ?
                                                                                on_countries_channel(channel, message)
                                                                            :
                                                                                channels.is_pending_set_channel(channel).then(yes =>
                                                                                    yes
                                                                                        ?
                                                                                            on_pending_set_channel(channel, message)
                                                                                        :
                                                                                            channels.is_history_channel(channel).then(yes =>
                                                                                                yes
                                                                                                    ?
                                                                                                        on_history_channel(channel, message)
                                                                                                    :
                                                                                                        channels.is_pending_del_channel(channel).then(yes =>
                                                                                                            yes
                                                                                                                ?
                                                                                                                    on_pending_del_channel(channel, message)
                                                                                                                :
                                                                                                                    channels.is_online_channel(channel).then(yes =>
                                                                                                                        yes
                                                                                                                            ?
                                                                                                                                on_online_channel(channel, message)
                                                                                                                            :
                                                                                                                                on_unsupported_channel(channel, message)
                                                                                                                    )
                                                                                                        )
                                                                                            )
                                                                                )
                                                                    )
                                                        )
                                            )
                                )
                    )
        )
            .catch(e => console.error(String(e)))
    )
    channels.get_all_sub_channels().then(all_sub_channels => {
        var done = all_sub_channels.reduce((done, _, i) => done + i + 1, 0)
        sub.on('subscribe', channel => {
            done -= 1 + all_sub_channels.findIndex(_ => _.equals(channel))
            done || redis_pub((e, pub) => {
                if (e) return n(e)
                channels.get_pub_sub_ready_channel().then(channel => {
                    published_pub_sub_ready_message_should_recived_before_start_loading_state = setTimeout(() => n(new Error('no pub_sub_ready message in ' + timeout + ' ms')), timeout)
                    pub.publish(channel, msgpack.encode(ready_message))
                })
            })
        })
        all_sub_channels.forEach(channel => sub.subscribe(channel))
    }).catch(n)
}))
