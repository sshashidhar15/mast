var redis = require('../redis')
var redis_pub = require('../redis_pub')
var msgpack = require('msgpack-lite')
var channels = require('./channels')
const config = require('../config')
const regulators = process.env.IS_CN_HOST === 'true' ? config.regulators_cn : config.regulators
const futures_model = {
    index: regulators.reduce((_, regulator) => {_[regulator] = null;return _}, {}),
    commodity: regulators.reduce((_, regulator) => {_[regulator] = null;return _}, {}),
    bonds: regulators.reduce((_, regulator) => {_[regulator] = null;return _}, {}),
    not_expired: {
        index: regulators.reduce((_, regulator) => {_[regulator] = null;return _}, {}),
        commodity: regulators.reduce((_, regulator) => {_[regulator] = null;return _}, {}),
        bonds: regulators.reduce((_, regulator) => {_[regulator] = null;return _}, {})
    }
}

const initial_state = {
    index: msgpack.encode(),
    commodity: msgpack.encode(),
    bonds: msgpack.encode()
}

// Initial state of all futures is same between all regulators
module.exports.create_initial_state_and_save_it_to_db = () =>  new Promise((y, n) => redis((e, db) =>
    e
        ?
            n(e)
        :
            Promise.all([
                new Promise((y, n) =>
                    db.hmset(
                        redis.FUTURES_INDEX,
                        regulators.reduce(
                            (acc, regulator) => {
                                acc[regulator] = initial_state.index
                                return acc
                            },
                            {}
                        ),
                        e => e ? n(e) : y()
                    )
                ),
                new Promise((y, n) =>
                    db.hmset(
                        redis.FUTURES_COMMODITY,
                        regulators.reduce(
                            (acc, regulator) => {
                                acc[regulator] = initial_state.commodity
                                return acc
                            },
                            {}
                        ),
                        e => e ? n(e) : y()
                    )
                ),
                new Promise((y, n) =>
                    db.hmset(
                        redis.FUTURES_BONDS,
                        regulators.reduce(
                            (acc, regulator) => {
                                acc[regulator] = initial_state.bonds
                                return acc
                            },
                            {}
                        ),
                        e => e ? n(e) : y()
                    )
                )
            ])
                .then(() => y())
                .catch(n)
        ))

module.exports.load_from_db = () => new Promise((y, n) => redis((e, db) =>
    e
        ?
            n(e)
        :
            Promise.all([
                Promise.all(
                    regulators.map(regulator =>
                        new Promise((y, n) =>
                            db.lindex(redis.FUTURES_INDEX[regulator], -1, (e, last_pack) => {
                                if (e) return n(e)
                                if (futures_model.index[regulator] === null) {// Important: Do not update model if it has a value from pub/sub
                                    futures_model.index[regulator] = msgpack.decode(last_pack || initial_state.index)
                                }
                                y()
                            })
                        )
                    )
                ),
                Promise.all(
                    regulators.map(regulator =>
                        new Promise((y, n) =>
                            db.lindex(redis.FUTURES_COMMODITY[regulator], -1, (e, last_pack) => {
                                if (e) return n(e)
                                if (futures_model.commodity[regulator] === null) {// Important: Do not update model if it has a value from pub/sub
                                    futures_model.commodity[regulator] = msgpack.decode(last_pack || initial_state.commodity)
                                }
                                y()
                            })
                        )
                    )
                ),
                Promise.all(
                    regulators.map(regulator =>
                        new Promise((y, n) =>
                            db.lindex(redis.FUTURES_BONDS[regulator], -1, (e, last_pack) => {
                                if (e) return n(e)
                                if (futures_model.bonds[regulator] === null) {// Important: Do not update model if it has a value from pub/sub
                                    futures_model.bonds[regulator] = msgpack.decode(last_pack || initial_state.bonds)
                                }
                                y()
                            })
                        )
                    )
                )
            ])
                .then(() => y())
                .catch(n)
        ))

const validate_index = json => new Promise((y, n) => {
    if (typeof json !== 'object') return n(new Error('index should be collection with typeof === object'))
    if (!json.length) return n(new Error('index should be collection with length property'))
    for (var i = 0;i < json.length;i++) {
        if (Object.keys(json[i]).length !== 5) return n(new Error('index should have only 5 properties'))
        if (!json[i].hasOwnProperty('name') || typeof json[i].name !== 'string') return n(new Error('name is required for index'))
        if (!json[i].hasOwnProperty('start_date') || typeof json[i].start_date !== 'string') return n(new Error('start_date is required for index'))
        if (!json[i].hasOwnProperty('close_only_date') || typeof json[i].close_only_date !== 'string') return n(new Error('close_only_date is required for index'))
        if (!json[i].hasOwnProperty('expire_date') || typeof json[i].expire_date !== 'string') return n(new Error('expire_date is required for index'))
        if (!json[i].hasOwnProperty('month') || typeof json[i].month !== 'string') return n(new Error('month is required for index'))
    }
    y(json)
})

const validate_commodity = json => new Promise((y, n) => {
    if (typeof json !== 'object') return n(new Error('commodity should be collection with typeof === object'))
    if (!json.length) return n(new Error('commodity should be collection with length property'))
    for (var i = 0;i < json.length;i++) {
        if (Object.keys(json[i]).length !== 5) return n(new Error('commodity should have only 5 properties'))
        if (!json[i].hasOwnProperty('name') || typeof json[i].name !== 'string') return n(new Error('name is required for commodity'))
        if (!json[i].hasOwnProperty('start_date') || typeof json[i].start_date !== 'string') return n(new Error('start_date is required for commodity'))
        if (!json[i].hasOwnProperty('close_only_date') || typeof json[i].close_only_date !== 'string') return n(new Error('close_only_date is required for commodity'))
        if (!json[i].hasOwnProperty('expire_date') || typeof json[i].expire_date !== 'string') return n(new Error('expire_date is required for commodity'))
        if (!json[i].hasOwnProperty('month') || typeof json[i].month !== 'string') return n(new Error('month is required for commodity'))
    }
    y(json)
})

const validate_bonds = json => new Promise((y, n) => {
    if (typeof json !== 'object') return n(new Error('bonds should be collection with typeof === object'))
    if (!json.length) return n(new Error('bonds should be collection with length property'))
    for (var i = 0;i < json.length;i++) {
        if (Object.keys(json[i]).length !== 5) return n(new Error('index should have only 5 properties'))
        if (!json[i].hasOwnProperty('name') || typeof json[i].name !== 'string') return n(new Error('name is required for bonds'))
        if (!json[i].hasOwnProperty('start_date') || typeof json[i].start_date !== 'string') return n(new Error('start_date is required for bonds'))
        if (!json[i].hasOwnProperty('close_only_date') || typeof json[i].close_only_date !== 'string') return n(new Error('close_only_date is required for bonds'))
        if (!json[i].hasOwnProperty('expire_date') || typeof json[i].expire_date !== 'string') return n(new Error('expire_date is required for bonds'))
        if (!json[i].hasOwnProperty('month') || typeof json[i].month !== 'string') return n(new Error('month is required for bonds'))
    }
    y(json)
})

module.exports.admin_change_index = (regulator, json) =>
    validate_index(json).then(json => msgpack.encode(json)).then(pack => new Promise((y, n) =>
        redis((e, db) =>
            e
                ?
                    n(e)
                :
                    db.rpush(redis.FUTURES_INDEX[regulator], pack, e =>
                        e
                            ?
                                n(e)
                            :
                                redis_pub((e, pub) =>
                                    e
                                        ?
                                            n(e)
                                        :
                                            channels.get_futures_index_channel(regulator)
                                                .then(channel =>
                                                    pub.publish(
                                                        channel,
                                                        pack,
                                                        () => y()
                                                    )
                                                )
                                                .catch(n)
                                )
                    )
        )
    ))

module.exports.admin_change_index_all = json =>
    validate_index(json).then(json => msgpack.encode(json)).then(pack => new Promise((y, n) =>
        redis((e, db) =>
            e
                ?
                    n(e)
                :
                    Promise.all(
                        regulators.map(regulator =>
                            new Promise((y, n) =>
                                db.rpush(redis.FUTURES_INDEX[regulator], pack, e => e ? n(e) : y())
                            )
                        )
                    )
                        .then(() =>
                            redis_pub((e, pub) =>
                                e
                                    ?
                                        n(e)
                                    :
                                        Promise.all(regulators.map(regulator => channels.get_futures_index_channel(regulator)
                                            .then(channel =>
                                                new Promise(y => pub.publish(
                                                    channel,
                                                    pack,
                                                    () => y()
                                                ))
                                            )
                                        ))
                                            .then(() => y())
                                            .catch(n)
                            )
                        )
        )
    ))

module.exports.admin_change_commodity = (regulator, json) =>
    validate_commodity(json).then(json => msgpack.encode(json)).then(pack => new Promise((y, n) =>
        redis((e, db) =>
            e
                ?
                    n(e)
                :
                    db.rpush(redis.FUTURES_COMMODITY[regulator], pack, e =>
                        e
                            ?
                                n(e)
                            :
                                redis_pub((e, pub) =>
                                    e
                                        ?
                                            n(e)
                                        :
                                            channels.get_futures_commodity_channel(regulator)
                                                .then(channel =>
                                                    pub.publish(
                                                        channel,
                                                        pack,
                                                        () => y()
                                                    )
                                                )
                                                .catch(n)
                                )
                    )
        )
    ))

module.exports.admin_change_commodity_all = json =>
    validate_commodity(json).then(json => msgpack.encode(json)).then(pack => new Promise((y, n) =>
        redis((e, db) =>
            e
                ?
                    n(e)
                :
                    Promise.all(
                        regulators.map(regulator =>
                            new Promise((y, n) =>
                                db.rpush(redis.FUTURES_COMMODITY[regulator], pack, e => e ? n(e) : y())
                            )
                        )
                    )
                        .then(() =>
                            redis_pub((e, pub) =>
                                e
                                    ?
                                        n(e)
                                        :
                                        Promise.all(regulators.map(regulator => channels.get_futures_commodity_channel(regulator)
                                            .then(channel =>
                                                new Promise(y => pub.publish(
                                                    channel,
                                                    pack,
                                                    () => y()
                                                ))
                                            )
                                        ))
                                            .then(() => y())
                                            .catch(n)
                            )
                        )
        )
    ))

module.exports.admin_change_bonds = (regulator, json) =>
    validate_bonds(json).then(json => msgpack.encode(json)).then(pack => new Promise((y, n) =>
        redis((e, db) =>
            e
                ?
                    n(e)
                :
                    db.rpush(redis.FUTURES_BONDS[regulator], pack, e =>
                        e
                            ?
                                n(e)
                            :
                                redis_pub((e, pub) =>
                                    e
                                        ?
                                            n(e)
                                        :
                                            channels.get_futures_bonds_channel(regulator)
                                                .then(channel =>
                                                    pub.publish(
                                                        channel,
                                                        pack,
                                                        () => y()
                                                    )
                                                )
                                                .catch(n)
                                )
                    )
        )
    ))

module.exports.admin_change_bonds_all = json =>
    validate_bonds(json).then(json => msgpack.encode(json)).then(pack => new Promise((y, n) =>
        redis((e, db) =>
            e
                ?
                    n(e)
                :
                    Promise.all(
                        regulators.map(regulator =>
                            new Promise((y, n) =>
                                db.rpush(redis.FUTURES_BONDS[regulator], pack, e => e ? n(e) : y())
                            )
                        )
                    )
                        .then(() =>
                            redis_pub((e, pub) =>
                                e
                                    ?
                                        n(e)
                                        :
                                        Promise.all(regulators.map(regulator => channels.get_futures_bonds_channel(regulator)
                                            .then(channel =>
                                                new Promise(y => pub.publish(
                                                    channel,
                                                    pack,
                                                    () => y()
                                                ))
                                            )
                                        ))
                                            .then(() => y())
                                            .catch(n)
                            )
                        )
        )
    ))

module.exports.update_index_from_redis_pub_sub = (regulator, _) => {
    futures_model.index[regulator] = _
}
module.exports.update_commodity_from_redis_pub_sub = (regulator, _) => {
    futures_model.commodity[regulator] = _
}
module.exports.update_bonds_from_redis_pub_sub = (regulator, _) => {
    futures_model.bonds[regulator] = _
}
module.exports.get_index = regulator => futures_model.index[regulator]
module.exports.get_commodity = regulator => futures_model.commodity[regulator]
module.exports.get_bonds = regulator => futures_model.bonds[regulator]

module.exports.admin_ask_index_history = regulator =>
    new Promise((y, n) =>
        redis((e, db) =>
            e
                ? n(e)
                : db.lrange(redis.FUTURES_INDEX[regulator], 0, -1, (e, packs) =>
                    e
                        ? n(e)
                        : y(packs.map(pack => msgpack.decode(pack))))))

module.exports.admin_ask_commodity_history = regulator =>
    new Promise((y, n) =>
        redis((e, db) =>
            e
                ? n(e)
                : db.lrange(redis.FUTURES_COMMODITY[regulator], 0, -1, (e, packs) =>
                    e
                        ? n(e)
                        : y(packs.map(pack => msgpack.decode(pack))))))

module.exports.admin_ask_bonds_history = regulator =>
    new Promise((y, n) =>
        redis((e, db) =>
            e
                ? n(e)
                : db.lrange(redis.FUTURES_BONDS[regulator], 0, -1, (e, packs) =>
                    e
                        ? n(e)
                        : y(packs.map(pack => msgpack.decode(pack))))))
