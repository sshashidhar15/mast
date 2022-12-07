/* global
is_superadmin
config_websocket_ping_frontend_period
debounce
_button_logout
msgpack
_tbody_admins_online
_table_admins_online
_a_nav_admins_online
_tbody_users
_table_users
_a_nav_users
*/
const inactivity_timeout = 30 * 60 * 1000
document.body.onmousemove = debounce(
    () => {
        if (Date.now() - Number(localStorage.getItem('last_activity')) >= inactivity_timeout)
        _button_logout.click()
        localStorage.setItem('last_activity', Date.now())
    },
    1000
)
const update = ([element, from]) => {
    var dt, ms, s, m, output
    dt = Date.now() - from
    ms = dt % 1000
    s = ((dt - ms) / 1000) % 60
    m = (((dt - ms) / 1000) - s) / 60
    output = s + ' sec'
    if (m > 0) output = m + ' min ' + output
    element.textContent = output
}
const user_tr_by_id = {}
function on_delete_manager_role_by_id_ready (id) {
    user_tr_by_id[id].children[2].innerHTML = ''
    if (is_superadmin) user_tr_by_id[id].children[2].appendChild(create_insert_button(id))
}
function on_insert_manager_role_by_id_ready (id) {
    user_tr_by_id[id].children[2].innerHTML = ''
    user_tr_by_id[id].children[2].appendChild(is_superadmin
        ? create_delete_button(id)
        : create_manager_span()
    )
}
function create_insert_button (id) {
    return create_button({
        payload: {insert_manager_role_by_id: id},
        button_text: 'Add manager role',
        question: 'Do you really want to add manager role?',
        className: 'btn btn-sm btn-primary'
    })
}
function create_delete_button (id) {
    return create_button({
        payload: {delete_manager_role_by_id: id},
        button_text: 'Delete manager role',
        question: 'Do you really want to delete manager role?',
        className: 'btn btn-sm btn-danger'
    })
}
function create_button (_) {
    var button = document.createElement('button')
    button.textContent = _.button_text
    button.className = _.className
    button.onclick = function () {
        if (window.confirm(_.question)) {
            button.setAttribute('disabled', 'disabled')
            ws.send(msgpack.encode(_.payload))
        }
    }
    return button
}
function create_manager_span () {
    const span = document.createElement('span')
    span.className = 'is_manager'
    span.textContent = 'Manager'
    return span
}
const ws = new WebSocket(location.href.replace(/\/admin.*/, '/admin/ws').replace('http', 'ws'))
const should_update = []
const ping = {
    id: 0,
    message: msgpack.encode({ping: 'ping'}),
    loop: () => {
        ws.send(ping.message)
        should_update.forEach(update)
        ping.id = setTimeout(ping.loop, config_websocket_ping_frontend_period)
    }
}
ws.binaryType = 'arraybuffer'
ws.onmessage = e => {
    _tbody_admins_online.innerHTML = ''
    while (should_update.length) should_update.pop()
    const msg = msgpack.decode(new Uint8Array(e.data))
    if (msg.type === 'delete_manager_role_by_id_ready') return on_delete_manager_role_by_id_ready(msg.id)
    if (msg.type === 'insert_manager_role_by_id_ready') return on_insert_manager_role_by_id_ready(msg.id)
    msg
        .map(_ => msgpack.decode(_))
        .forEach(session => {
            const tr = document.createElement('tr')
            const td_login = document.createElement('td')
            const td_from = document.createElement('td')
            const td_delete = document.createElement('td')
            const button_remove = document.createElement('button')
            button_remove.textContent = 'Delete manager role'
            button_remove.className = 'btn btn-sm btn-danger'
            button_remove.onclick = () => ws.send(msgpack.encode({delete_manager_role: session.token}))
            td_delete.appendChild(button_remove)
            tr.appendChild(td_login)
            tr.appendChild(td_from)
            tr.appendChild(td_delete)
            td_login.textContent = session.login
            should_update.push([td_from, session.create_time])
            update([td_from, session.create_time])
            _tbody_admins_online.appendChild(tr)
        })
}
ws.onopen = ping.loop
ws.onclose = () => clearTimeout(ping.id)
ws.onerror = () => clearTimeout(ping.id)
_a_nav_admins_online.onclick = e => {
    e.preventDefault()
    document.getElementsByClassName('container-fluid')[0].style.display = 'none'
    _table_users.style.display = 'none'
    _table_admins_online.style.display = ''

}
_a_nav_users.onclick = e => {
    e.preventDefault()
    document.getElementsByClassName('container-fluid')[0].style.display = 'none'
    _table_admins_online.style.display = 'none'
    _table_users.style.display = ''
    fetch(
        '/' + location.pathname.split('/')[1] + '/' + location.pathname.split('/')[2] + '/admin/get_users',
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            }
        }
    )
        .then(_ => _.ok ? _.json() : Promise.reject(new Error('get_users fail')))
        .then(({users}) => {
            const users_map_by_id = users.reduce(
                (_, user) => {
                    _[user.id] = _[user.id] || {login: user.login, roles: []}
                    _[user.id].roles.push(user.role_id)
                    return _
                },
                {}
            )
            Object.keys(users_map_by_id).forEach(id => {
                const user = users_map_by_id[id]
                const is_manager = user.roles.includes(4)
                const tr = document.createElement('tr')
                const td_id = document.createElement('td')
                const td_login = document.createElement('td')
                const td_value = document.createElement('td')
                if (is_superadmin) td_value.appendChild(is_manager
                    ? create_delete_button(id)
                    : create_insert_button(id))
                else if (is_manager) td_value.appendChild(create_manager_span())
                tr.appendChild(td_id)
                tr.appendChild(td_login)
                tr.appendChild(td_value)
                td_id.textContent = id
                td_login.textContent = user.login
                _tbody_users.appendChild(tr)
                user_tr_by_id[id] = tr
            })
        })
}
