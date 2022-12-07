const msgpack = require('msgpack-lite')
const config = require('../config')
const redis = require('../redis')
const langs = config.locales.map(_ => _.code)
const regulators = process.env.IS_CN_HOST === 'true' ? config.regulators_cn : config.regulators
const type = {
    translation: 'translation',
    futures: {
        index: 'index',
        commodity: 'commodity',
        bonds: 'bonds'
    },
    pub_sub_ready: 'pub_sub_ready',
    monitoring: 'monitoring',
    countries: 'countries',
    pendings: {
        set: 'pendings_set',
        del: 'pendings_del'
    },
    history: 'history(approved pendings)',
    online: 'online'
}


// cache for Promise.resolve(cache)
let all_channels
let channels_tree
let all_translations_channels
let all_pending_set_channels
let all_pending_del_channels
let all_history_channels
let all_futures_index_channels
let all_futures_commodity_channels
let all_futures_bonds_channels

// This function should be executed once in migration for create initial state for CHANNELS
module.exports.create_channels_tree = () =>
    new Promise((y, n) =>
        redis((e, db) =>
            e
                ?
                    n(e)
                :
                    db.set(
                        redis.CHANNELS,
                        msgpack.encode({
                            translation: regulators.reduce(
                                (translation, regulator) => {
                                    translation[regulator] = langs.reduce(
                                        (translation_regulator, lang) => {
                                            const channel = msgpack.encode({type: type.translation, regulator, lang})
                                            translation_regulator[lang] = channel
                                            return translation_regulator
                                        },
                                        {}
                                    )
                                    return translation
                                },
                                {}
                            ),
                            futures: {
                                index: regulators.reduce(
                                    (futures, regulator) => {
                                        const channel = msgpack.encode({type: type.futures.index, regulator})
                                        futures[regulator] = channel
                                        return futures
                                    },
                                    {}
                                ),
                                commodity: regulators.reduce(
                                    (futures, regulator) => {
                                        const channel = msgpack.encode({type: type.futures.commodity, regulator})
                                        futures[regulator] = channel
                                        return futures
                                    },
                                    {}
                                ),
                                bonds: regulators.reduce(
                                    (bonds, regulator) => {
                                        const channel = msgpack.encode({type: type.futures.bonds, regulator})
                                        bonds[regulator] = channel
                                        return bonds
                                    },
                                    {}
                                )
                            },
                            pub_sub_ready: msgpack.encode({type: type.pub_sub_ready})
                        }),
                        e => e ? n(e) : y()
                    )
        )
    )

const get_channels_tree = () =>
    channels_tree
        ?
            Promise.resolve(channels_tree)
        :
            new Promise((y, n) =>
                redis((e, db) =>
                    e
                        ?
                            n(e)
                        :
                            db.get(redis.CHANNELS, (e, _) =>
                                e
                                    ?
                                        n(e)
                                    :
                                        _ ? y(msgpack.decode(_)) : n(e)
                            )
                )
            )
                .then(_ => {
                    channels_tree = _
                    var must_update = false
                    regulators.forEach(regulator => {
                        if (channels_tree.translation[regulator] === undefined) {
                            channels_tree.translation[regulator] = langs.reduce(
                                (_, lang) => {
                                    _[lang] = msgpack.encode({type: type.translation, regulator, lang})
                                    return _
                                },
                                {}
                            )
                            must_update = true
                        }
                        if (channels_tree.pending_set[regulator] === undefined) {
                            channels_tree.pending_set[regulator] = msgpack.encode({type: type.pendings.set, regulator})
                            must_update = true
                        }
                        if (channels_tree.pending_del[regulator] === undefined) {
                            channels_tree.pending_del[regulator] = msgpack.encode({type: type.pendings.del, regulator})
                            must_update = true
                        }
                        if (channels_tree.history[regulator] === undefined) {
                            channels_tree.history[regulator] = msgpack.encode({type: type.history, regulator})
                            must_update = true
                        }
                        if (channels_tree.futures.index[regulator] === undefined) {
                            channels_tree.futures.index[regulator] = msgpack.encode({type: type.futures.index, regulator})
                            must_update = true
                        }
                        if (channels_tree.futures.commodity[regulator] === undefined) {
                            channels_tree.futures.commodity[regulator] = msgpack.encode({type: type.futures.commodity, regulator})
                            must_update = true
                        }
                        if (channels_tree.futures.bonds[regulator] === undefined) {
                            channels_tree.futures.bonds[regulator] = msgpack.encode({type: type.futures.bonds, regulator})
                            must_update = true
                        }
                    })
                    return must_update
                        ? new Promise((y, n) => redis((e, db) => e ? n(e) : db.set(redis.CHANNELS, msgpack.encode(channels_tree), e =>
                            e
                                ?
                                    n(e)
                                :
                                    y(channels_tree)
                        )))
                        : channels_tree
                })

const get_all_sub_channels = () =>
    all_channels
        ?
            Promise.resolve(all_channels)
        :
            get_channels_tree()
                .then(channels_tree => {
                    all_channels = [].concat(
                        Object.keys(channels_tree.translation).reduce(
                            (channels, regulator) =>
                                channels.concat(
                                    Object.values(channels_tree.translation[regulator])
                                ),
                            []
                        ),
                        Object.keys(channels_tree.pending_set).reduce(
                            (channels, regulator) =>
                                channels.concat(channels_tree.pending_set[regulator]),
                            []
                        ),
                        Object.keys(channels_tree.pending_del).reduce(
                            (channels, regulator) =>
                                channels.concat(channels_tree.pending_del[regulator]),
                            []
                        ),
                        Object.keys(channels_tree.history).reduce(
                            (channels, regulator) =>
                                channels.concat(channels_tree.history[regulator]),
                            []
                        ),
                        Object.values(channels_tree.futures.index),
                        Object.values(channels_tree.futures.commodity),
                        Object.values(channels_tree.futures.bonds),
                        channels_tree.pub_sub_ready,
                        channels_tree.countries,
                        channels_tree.online
                    )
                    return all_channels
                })

const get_all_translations_channels = () =>
    all_translations_channels
        ?
            Promise.resolve(all_translations_channels)
        :
            get_channels_tree()
                .then(channels_tree => {
                    all_translations_channels = Object.keys(channels_tree.translation).reduce(
                        (channels, regulator) =>
                            channels.concat(
                                Object.values(channels_tree.translation[regulator])
                            ),
                        []
                    )
                    return all_translations_channels
                })

const get_all_pending_set_channels = () =>
    all_pending_set_channels
        ?
            Promise.resolve(all_pending_set_channels)
        :
            get_channels_tree()
                .then(channels_tree => {
                    all_pending_set_channels = Object.values(channels_tree.pending_set)
                    return all_pending_set_channels
                })

const get_all_pending_del_channels = () =>
    all_pending_del_channels
        ?
            Promise.resolve(all_pending_del_channels)
        :
            get_channels_tree()
                .then(channels_tree => {
                    all_pending_del_channels = Object.values(channels_tree.pending_del)
                    return all_pending_del_channels
                })

const get_all_history_channels = () =>
    all_history_channels
        ?
            Promise.resolve(all_history_channels)
        :
            get_channels_tree()
                .then(channels_tree => {
                    all_history_channels = Object.values(channels_tree.history)
                    return all_history_channels
                })

const get_all_futures_index_channels = () =>
    all_futures_index_channels
        ?
            Promise.resolve(all_futures_index_channels)
        :
            get_channels_tree()
                .then(channels_tree => {
                    all_futures_index_channels = Object.values(channels_tree.futures.index)
                    return all_futures_index_channels
                })

const get_all_futures_commodity_channels = () =>
    all_futures_commodity_channels
        ?
            Promise.resolve(all_futures_commodity_channels)
        :
            get_channels_tree()
                .then(channels_tree => {
                    all_futures_commodity_channels = Object.values(channels_tree.futures.commodity)
                    return all_futures_commodity_channels
                })

const get_all_futures_bonds_channels = () =>
    all_futures_bonds_channels
        ?
            Promise.resolve(all_futures_bonds_channels)
        :
            get_channels_tree()
                .then(channels_tree => {
                    all_futures_bonds_channels = Object.values(channels_tree.futures.bonds)
                    return all_futures_bonds_channels
                })


module.exports.type = type
module.exports.get_channels_tree = get_channels_tree
module.exports.get_all_sub_channels = get_all_sub_channels
module.exports.get_pub_sub_ready_channel = () => get_channels_tree().then(channels_tree => channels_tree.pub_sub_ready)
module.exports.get_online_channel = () => get_channels_tree().then(_ => _.online)
module.exports.get_translations_channel = (regulator, lang) => get_channels_tree().then(_ => _.translation[regulator][lang])
module.exports.get_pending_set_channel = (regulator) => get_channels_tree().then(_ => _.pending_set[regulator])
module.exports.get_pending_del_channel = (regulator) => get_channels_tree().then(_ => _.pending_del[regulator])
module.exports.get_history_channel = (regulator) => get_channels_tree().then(_ => _.history[regulator])
module.exports.get_futures_index_channel = regulator => get_channels_tree().then(_ => _.futures.index[regulator])
module.exports.get_futures_commodity_channel = regulator => get_channels_tree().then(_ => _.futures.commodity[regulator])
module.exports.get_futures_bonds_channel = regulator => get_channels_tree().then(_ => _.futures.bonds[regulator])
module.exports.get_monitoring_channel = () => get_channels_tree().then(_ => _.monitoring.www2)
module.exports.is_translations_channel = channel => get_all_translations_channels().then(_ => Boolean(_.find(_ => _.equals(channel))))
module.exports.is_pending_set_channel = channel => get_all_pending_set_channels().then(_ => Boolean(_.find(_ => _.equals(channel))))
module.exports.is_pending_del_channel = channel => get_all_pending_del_channels().then(_ => Boolean(_.find(_ => _.equals(channel))))
module.exports.is_history_channel = channel => get_all_history_channels().then(_ => Boolean(_.find(_ => _.equals(channel))))
module.exports.is_futures_index_channel = channel => get_all_futures_index_channels().then(_ => Boolean(_.find(_ => _.equals(channel))))
module.exports.is_futures_commodity_channel = channel => get_all_futures_commodity_channels().then(_ => Boolean(_.find(_ => _.equals(channel))))
module.exports.is_futures_bonds_channel = channel => get_all_futures_bonds_channels().then(_ => Boolean(_.find(_ => _.equals(channel))))
module.exports.is_pub_sub_ready_channel = channel => get_channels_tree().then(_ => _.pub_sub_ready.equals(channel))
module.exports.is_countries_channel = channel => get_channels_tree().then(_ => _.countries.equals(channel))
module.exports.is_online_channel = channel => get_channels_tree().then(_ => _.online.equals(channel))
