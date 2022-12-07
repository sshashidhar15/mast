const redis = require('../redis')
const redis_pub = require('../redis_pub')
const channels = require('./channels')
const msgpack = require('msgpack-lite')
const fetch = require('node-fetch')
const config = require('../config')
const get_manager_login_by_token = require('./get_manager_login_by_token')
const get_id_by_token = require('./get_id_by_token')
const WebSocket = require('ws')
const wss = new WebSocket.Server({noServer: true})
const state = {
    online: [],
    sessions: [],
    ws_by_login: {}
}

function redis_promise () {
    return new Promise((y, n) =>
        redis((error, db) =>
            error
                ? n(error)
                : y(db)
        )
    )
}

function kick (ws, login, session) {
    const index = state.online.indexOf(ws)
    if (index === -1) return
    state.online.splice(index, 1)
    ws.close()
    redis((e, db) =>
        e
            ? console.log(e)
            : db.hdel(redis.ONLINE, login, e => {
                if (e) return console.log(e)
                redis_pub((e, pub) => {
                    if (e) console.log(e)
                    const index = state.sessions.findIndex(_ => _.equals(session))
                    if (index === -1) return
                    state.sessions.splice(index, 1)
                    //setTimeout(sessions_history.add, 0, session)
                    channels.get_online_channel().then(channel =>
                        pub.publish(
                            channel,
                            msgpack.encode(state.sessions),
                            () => null
                        )
                    )
                })
            })
    )
}

function user_can_enter (req) {
    const {manager_token} = req.headers.cookie.split(';').reduce(
        (cookies, _) => {
            const [key, value] = _.split('=').map(_ => _.trim())
            cookies[key] = value
            return cookies
        },
        {}
    )
    return req.url.indexOf('/admin/ws') !== -1 && manager_token
        ?
            fetch(
                config.auth_service_url + '/manager/token_validate',
                {
                    method: 'POST',
                    body: msgpack.encode({token: manager_token})
                }
            )
                .then(_ => _.ok ? _.buffer() : Promise.reject(new Error(_.status)))
                .then(_ => msgpack.decode(_))
                .then(valid =>
                    valid === true
                        ? get_manager_login_by_token(manager_token).then(login => [login, manager_token])
                        : Promise.reject(new Error('access denied to WebSocket'))
                )
        :
            Promise.reject(new Error('access denied to WebSocket'))
}

module.exports.load = () =>
    redis_promise()
        .then(db =>
            db.hgetall(redis.ONLINE, (e, sessions) => {
                if (e) return console.log(e)
                if (state.sessions === null)
                    state.sessions = sessions
            })
        )

module.exports.on_sessions = _ => {
    state.sessions = msgpack.decode(_)
    state.online.forEach(ws => ws.send(_))
}

function on_delete_manager_role (who, whom) {
    return Promise.all([
        get_manager_login_by_token(whom),
        get_id_by_token(whom)
    ])
        .then(([login, id]) =>
            on_delete_manager_role_by_id(who, id)
                .then(() => {
                    if (state.ws_by_login[login]) {
                        while (state.ws_by_login[login].length) state.ws_by_login[login].pop().close()
                        delete state.ws_by_login[login]
                    }
                })
        )
}
function on_delete_manager_role_by_id (who, id) {
    return fetch(
        config.auth_service_url + '/manager/delete_manager_role',
        {
            method: 'POST',
            body: msgpack.encode({
                who,
                id
            })
        }
    )
}
function on_insert_manager_role_by_id (who, id) {
    return fetch(
        config.auth_service_url + '/manager/insert_manager_role',
        {
            method: 'POST',
            body: msgpack.encode({
                who,
                id
            })
        }
    )
}

const ws_send_reducer = (_, ws) => {
    ws.send(_)
    return _
}
const onmessage = (ws, login, manager_token, session) => event => {
    ws.id = setTimeout(() => kick(ws, login, session), config.websocket.ping.server_max_wait, clearTimeout(ws.id))
    const message = msgpack.decode(event.data)
    if (message.delete_manager_role) on_delete_manager_role(manager_token, message.delete_manager_role)
    if (message.delete_manager_role_by_id) on_delete_manager_role_by_id(manager_token, message.delete_manager_role_by_id)
        .then(() =>
            state.online.reduce(
                ws_send_reducer,
                msgpack.encode({
                    type: 'delete_manager_role_by_id_ready',
                    id: message.delete_manager_role_by_id
                })
            )
        )
    if (message.insert_manager_role_by_id) on_insert_manager_role_by_id(manager_token, message.insert_manager_role_by_id)
        .then(() =>
            state.online.reduce(
                ws_send_reducer,
                msgpack.encode({
                    type: 'insert_manager_role_by_id_ready',
                    id: message.insert_manager_role_by_id
                })
            )
        )
}

module.exports.onupgrade = (req, socket, head) =>
    user_can_enter(req)
        .then(([login, manager_token]) =>
            wss.handleUpgrade(req, socket, head, ws => {
                const session = msgpack.encode({
                    login,
                    manager_token,
                    create_time: Date.now()
                })
                state.online.push(ws)
                state.ws_by_login[login] = state.ws_by_login[login] || []
                state.ws_by_login[login].push(ws)
                ws.id = setTimeout(() => kick(ws, login, session), config.websocket.ping.server_max_wait)
                ws.onmessage = onmessage(ws, login, manager_token, session)
                redis((e, db) => {
                    if (e) return console.log(e)
                    db.hset(redis.ONLINE, login, session, E => {
                        if (E) return console.log(E)
                        redis_pub((e, pub) => {
                            if (e) console.log(e)
                            channels.get_online_channel().then(channel =>
                                pub.publish(
                                    channel,
                                    msgpack.encode(state.sessions.concat(session)),
                                    () => null
                                )
                            )
                        })
                    })
                })
            })
        )
