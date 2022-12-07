/* global
msgpack
localforage
langs
debounce
regulator
_pendings
_select_locale
_input_approved_by
_input_note
_input_time_from
_input_time_to
_input_count_changed_keys_from
_input_count_changed_keys_to
_icon_sort_up_count_changed_keys
_icon_sort_down_count_changed_keys
_icon_sort_up_time
_icon_sort_down_time
_icon_sort_up_locale
_icon_sort_down_locale
_icon_sort_up_note
_icon_sort_down_note
_icon_sort_up_approved_by
_icon_sort_down_approved_by
_input_filter_by_values
_input_filter_by_keys
_button_restore_default_settings
*/

const looking_on_success_timeout = 1000
const before_close_diff_after_revert_timeout = 1000
const looking_on_error_timeout = 30000
const MIN_DELAY_BETWEEN_SAVE = 2000
const MIN_DELAY_BETWEEN_INPUT_UPDATE = 200
// const USER_IS_SLEEPING = 1000
const default_user_settings = {
    filters: {
        locale: 'All',
        approved_by: '',
        note: '',
        time: {
            from: '',
            to: ''
        },
        value: '',
        key: '',
        count_changed_keys: {
            from: '',
            to: ''
        }
    },
    sort: '_icon_sort_down_time'
}
const state = {
    pendings: [],
    user_settings: JSON.parse(JSON.stringify(default_user_settings))
}

const save_user_settings = debounce(() => localforage.setItem('user_settings', msgpack.encode(state.user_settings)), MIN_DELAY_BETWEEN_SAVE)

function gen_diff (before, changes) {
    return Object.keys(before).map(key =>
        [
            key,
            before[key],
            changes[key]
        ]
    )
}

function pending_time (pending) {
    const td = document.createElement('td')

    td.textContent = new Date(pending.approve_time).toISOString()

    return td
}

function pending_lang (pending) {
    const td = document.createElement('td')

    td.textContent = pending.locale.toUpperCase()

    return td
}

function pending_note (pending) {
    const td = document.createElement('td')

    td.textContent = pending.note

    return td
}

function pending_approved_by (pending) {
    const td = document.createElement('td')

    td.textContent = pending.approve_manager_login

    return td
}

const pending_keys = count_diff_keys => () => {
    const td = document.createElement('td')

    td.textContent = count_diff_keys

    return td
}

function pending_diff (pending, tr_pending, tr_pending_diff) {
    const td = document.createElement('td')
    const button_diff = document.createElement('button')
    const button_revert = document.createElement('button')
    const button_move = document.createElement('button')

    td.classList.add('button-container')

    button_diff.className = 'btn btn-sm btn-info diff'
    button_diff.textContent = 'Diff'
    button_diff.onclick = () => {
        tr_pending_diff.style.display = tr_pending_diff.style.display === 'none'
            ? ''
            : 'none'
        button_revert.style.display = button_revert.style.display === 'none'
            ? ''
            : 'none'
        button_move.style.display = button_move.style.display === 'none'
            ? ''
            : 'none'
    }

    td.appendChild(button_diff)

    button_revert.className = 'btn btn-sm btn-primary'
    button_revert.textContent = 'Revert'
    button_revert.style.display = 'none'
    button_revert.onclick = () => {
        const reason = prompt('Revert reason')
        if (!reason) return
        button_revert.setAttribute('disabled', 'disabled')
        button_revert.innerHTML = '<b>🔃</b>'
        fetch(
            location.href.replace('history', 'revert'),
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    locale: pending.locale,
                    token: pending.token,
                    reason
                })
            }
        )
            .then(() => {
                button_revert.classList.add('btn-success')
                setTimeout(
                    () => {
                        button_revert.classList.remove('btn-success')
                        button_revert.removeAttribute('disabled')
                        button_revert.innerHTML = 'Revert'
                        setTimeout(
                            () => button_diff.click(),
                            before_close_diff_after_revert_timeout
                        )
                    },
                    looking_on_success_timeout
                )
            })
            .catch(e => {
                button_revert.classList.add('btn-warning')
                button_revert.innerHTML = e.message || e
                setTimeout(
                    () => {
                        button_revert.classList.remove('btn-warning')
                        button_revert.removeAttribute('disabled')
                        button_revert.innerHTML = 'Revert'
                    },
                    looking_on_error_timeout
                )
            })
    }

    td.appendChild(button_revert)

    button_move.className = 'btn btn-sm btn-success'
    button_move.textContent = 'Move'
    button_move.style.display = 'none'
    button_move.onclick = () =>
        localforage.setItem(
            'user_settings (move)',
            msgpack.encode({
                lang: {
                    from: pending.locale,
                    to: pending.locale
                },
                regulator: {
                    from: regulator,
                    to: regulator
                },
                filters: {
                  include: Object.keys(pending.translations),
                  exclude: []
                }
            }),
            () => location.href = location.href.replace('history', 'move')
        )
    td.appendChild(button_move)

    return td
}

function pending_diff_legacy (pending, tr_pending, tr_pending_diff) {
    const td = document.createElement('td')

    td.classList.add('button-container')

    const button_diff = document.createElement('button')
    button_diff.className = 'btn btn-sm btn-info diff'
    button_diff.textContent = 'Diff'
    button_diff.onclick = () =>
        tr_pending_diff.style.display = tr_pending_diff.style.display === 'none'
            ? ''
            : 'none'

    td.appendChild(button_diff)
    return td
}

function create_element_pending_diff (diffs, count_columns) {
    const td = document.createElement('td')
    td.setAttribute('colspan', String(count_columns))
    const table = document.createElement('table')
    table.setAttribute('border', '1')
    table.style = 'width:100%;'
    table.className = 'diff-table'

    const thead = document.createElement('thead')
    thead.style = 'background:#999; color:#fff;'
    thead.innerHTML = `
        <tr>
            <th width="150">Key</th>
            <th>Before</th>
            <th>Changes</th>
        </tr>`

    const tbody = document.createElement('tbody')

    diffs.forEach(diff => {
        const tr = document.createElement('tr')
        const td0 = document.createElement('td')
        const td1 = document.createElement('td')
        const td2 = document.createElement('td')

        td0.textContent = diff[0]
        td1.textContent = diff[1]
        td2.textContent = diff[2]

        tr.appendChild(td0)
        tr.appendChild(td1)
        tr.appendChild(td2)

        tbody.appendChild(tr)
    })

    table.appendChild(thead)
    table.appendChild(tbody)
    td.appendChild(table)

    return td
}


function render_legacy_pending (pending) {
    const diffs = gen_diff(
        Object.keys(pending.translations).reduce((o, _) => {o[_] = '?';return o}, {}),
        pending.translations
    )

    const tr_pending = document.createElement('tr')
    const tr_pending_diff = document.createElement('tr')

    tr_pending_diff.style = 'display: none;'

    const create_elements = [
            pending_time,
            pending_note,
            pending_approved_by,
            pending_lang,
            pending_keys(diffs.length),
            pending_diff_legacy
    ]
    const count_columns = create_elements.length

    if (diffs.length > 0) tr_pending_diff.appendChild(create_element_pending_diff(diffs, count_columns))

    create_elements.forEach(create_element =>
        tr_pending.appendChild(
            create_element(pending, tr_pending, tr_pending_diff)
        )
    )

    _pendings.appendChild(tr_pending)
    _pendings.appendChild(tr_pending_diff)
}

function render_pending (pending) {
    const diffs = gen_diff(pending.before, pending.translations)

    const tr_pending = document.createElement('tr')
    const tr_pending_diff = document.createElement('tr')

    tr_pending_diff.style = 'display: none;'

    const create_elements = [
            pending_time,
            pending_note,
            pending_approved_by,
            pending_lang,
            pending_keys(diffs.length),
            pending_diff
    ]
    const count_columns = create_elements.length

    if (diffs.length > 0) tr_pending_diff.appendChild(create_element_pending_diff(diffs, count_columns))

    create_elements.forEach(create_element =>
        tr_pending.appendChild(
            create_element(pending, tr_pending, tr_pending_diff)
        )
    )

    _pendings.appendChild(tr_pending)
    _pendings.appendChild(tr_pending_diff)
}

function render () {
    _pendings.innerHTML = ''

    apply_sort(
        apply_filters(
            state.pendings,
            state.user_settings.filters
        ),
        state.user_settings.sort
    )
        .forEach(pending =>
            pending.before
                ? render_pending(pending)
                : render_legacy_pending(pending)
        )
}

// function load_history (regulator) {
//     return new Promise(_ => localforage.ready(_))
//             .then(() => localforage.getItem('history-' + regulator))
//             .then(_ =>
//                 _
//                     ? msgpack.decode(_)
//                     : []
//             )
//             .then(cache =>
//                 fetch(
//                     location.href,
//                     {
//                         method: 'POST',
//                         headers: {
//                             'Content-Type': 'application/json',
//                         },
//                         body: JSON.stringify({
//                             cache_length: cache.length
//                         })
//                     }
//                 )
//                     .then(_ => _.arrayBuffer())
//                     .then(_ => msgpack.decode(new Uint8Array(_)))
//                     .then(_ => _.map(_ => msgpack.decode(_)))
//                     .then(latest => {
//                         const history = latest.concat(cache)
//                         console.log('latest length', latest.length)
//                         console.log('cache length', cache.length)
//                         const save_function = () => localforage.setItem('history-' + regulator, msgpack.encode(history))
//                         if (latest.length)
//                             window.requestIdleCallback
//                                 ? requestIdleCallback(save_function, {timeout: USER_IS_SLEEPING})
//                                 : setTimeout(save_function, 0)
//                         return history
//                     })
//             )
// }

function load_history_new () {
    return  fetch(
                    location.href,
                    {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            cache_length: 0
                        })
                    }
                )
                    .then(_ => _.arrayBuffer())
                    .then(_ => msgpack.decode(new Uint8Array(_)))
                    .then(_ => _.map(_ => msgpack.decode(_)))
                    .then(latest => {
                        if (latest.length)
                        return latest
                    })
}

function apply_sort (pendings, sort) {
    if (sort === '_icon_sort_up_count_changed_keys') return pendings.sort((a, b) => Object.keys(a.translations).length - Object.keys(b.translations).length)
    if (sort === '_icon_sort_down_count_changed_keys') return pendings.sort((a, b) => Object.keys(b.translations).length - Object.keys(a.translations).length)
    if (sort === '_icon_sort_up_time') return pendings.sort((a, b) => a.approve_time - b.approve_time)
    if (sort === '_icon_sort_down_time') return pendings.sort((a, b) => b.approve_time - a.approve_time)
    if (sort === '_icon_sort_up_locale') return pendings.sort((a, b) => a.locale > b.locale ? 1 : a.locale < b.locale ? -1 : 0)
    if (sort === '_icon_sort_down_locale') return pendings.sort((a, b) => b.locale > a.locale ? 1 : b.locale < a.locale ? -1 : 0)
    if (sort === '_icon_sort_up_note') return pendings.sort((a, b) => a.note > b.note ? 1 : a.note < b.note ? -1 : 0)
    if (sort === '_icon_sort_down_note') return pendings.sort((a, b) => b.note > a.note ? 1 : b.note < a.note ? -1 : 0)
    if (sort === '_icon_sort_up_approved_by') return pendings.sort((a, b) => a.approved_by > b.approved_by ? 1 : a.approved_by < b.approved_by ? -1 : 0)
    if (sort === '_icon_sort_down_approved_by') return pendings.sort((a, b) => b.approved_by > a.approved_by ? 1 : b.approved_by < a.approved_by ? -1 : 0)
    return pendings
}

function apply_filters (pendings, filters) {
    return pendings
        .filter(pending => {
            if (filters.locale === 'All') return true
            if (filters.locale === pending.locale) return true
            return false
        })
        .filter(pending => {
            if (filters.approved_by === '') return true
            if (pending.approve_manager_login) return pending.approve_manager_login.includes(filters.approved_by)
            return false
        })
        .filter(pending => {
            if (filters.note === '') return true
            if (pending.note) return pending.note.includes(filters.note)
            return false
        })
        .filter(pending => {
            if (filters.value === '') return true
            const keys = Object.keys(pending.translations)
            for (var i = 0;i < keys.length;i++)
                if (
                    pending.translations[keys[i]].includes(filters.value) ||
                    pending.before && pending.before[keys[i]].includes(filters.value)
                )
                    return true
            return false
        })
        .filter(pending => {
            if (filters.key === '') return true
            const keys = Object.keys(pending.translations)
            for (var i = 0;i < keys.length;i++)
                if (keys[i].includes(filters.key))
                    return true
            return false
        })
        .filter(pending => {
            if (filters.time.from === '' || filters.time.to === '') return true
            if (pending.approve_time < new Date(filters.time.from).valueOf()) return false
            if (pending.approve_time > new Date(filters.time.to).valueOf()) return false
            return true
        })
        .filter(pending => {
            if (filters.count_changed_keys.from === '' || filters.count_changed_keys.to === '') return true
            if (Object.keys(pending.translations).length < Number(filters.count_changed_keys.from)) return false
            if (Object.keys(pending.translations).length > Number(filters.count_changed_keys.to)) return false
            return true
        })
}

_input_approved_by.onkeyup = debounce(
    () => {
        if (state.user_settings.filters.approved_by !== _input_approved_by.value) {
            state.user_settings.filters.approved_by = _input_approved_by.value
            render()
            save_user_settings()
        }
    },
    MIN_DELAY_BETWEEN_INPUT_UPDATE
)

_input_note.onkeyup = debounce(
    () => {
        if (state.user_settings.filters.note !== _input_note.value) {
            state.user_settings.filters.note = _input_note.value
            render()
            save_user_settings()
        }
    },
    MIN_DELAY_BETWEEN_INPUT_UPDATE
)

_input_time_from.onchange = () => {
    if (state.user_settings.filters.time.from !== _input_time_from.value) {
        state.user_settings.filters.time.from = _input_time_from.value
        render()
        save_user_settings()
    }
}

_input_time_to.onchange = () => {
    if (state.user_settings.filters.time.to !== _input_time_to.value) {
        state.user_settings.filters.time.to = _input_time_to.value
        render()
        save_user_settings()
    }
}

_input_count_changed_keys_from.onchange = () => {
    if (state.user_settings.filters.count_changed_keys.from !== _input_count_changed_keys_from.value) {
        state.user_settings.filters.count_changed_keys.from = _input_count_changed_keys_from.value
        render()
        save_user_settings()
    }
}

_input_count_changed_keys_to.onchange = () => {
    if (state.user_settings.filters.count_changed_keys.to !== _input_count_changed_keys_to.value) {
        state.user_settings.filters.count_changed_keys.to = _input_count_changed_keys_to.value
        render()
        save_user_settings()
    }
}

_select_locale.onchange = () => {
    if (state.user_settings.filters.locale !== _select_locale.value) {
        state.user_settings.filters.locale = _select_locale.value
        render()
        save_user_settings()
    }
}

function handle_sort_click (event) {
    if (state.user_settings.sort !== event.target.id) {
        document.getElementById(state.user_settings.sort).classList.remove('active')
        state.user_settings.sort = event.target.id
        render()
        document.getElementById(state.user_settings.sort).classList.add('active')
        save_user_settings()
    }
}

_icon_sort_up_count_changed_keys.onclick = handle_sort_click
_icon_sort_down_count_changed_keys.onclick = handle_sort_click
_icon_sort_up_time.onclick = handle_sort_click
_icon_sort_down_time.onclick = handle_sort_click
_icon_sort_up_locale.onclick = handle_sort_click
_icon_sort_down_locale.onclick = handle_sort_click
_icon_sort_up_note.onclick = handle_sort_click
_icon_sort_down_note.onclick = handle_sort_click
_icon_sort_up_approved_by.onclick = handle_sort_click
_icon_sort_down_approved_by.onclick = handle_sort_click

_button_restore_default_settings.onclick = () => {
    document.getElementById(state.user_settings.sort).classList.remove('active')
    state.user_settings = JSON.parse(JSON.stringify(default_user_settings))
    set_user_settings_to_controls(state.user_settings)
    render()
    save_user_settings()
}

_input_filter_by_values.onkeyup = debounce(
    () => {
        if (state.user_settings.filters.value !== _input_filter_by_values.value) {
            state.user_settings.filters.value = _input_filter_by_values.value
            render()
            save_user_settings()
        }
    },
    MIN_DELAY_BETWEEN_INPUT_UPDATE
)

_input_filter_by_keys.onkeyup = debounce(
    () => {
        if (state.user_settings.filters.key !== _input_filter_by_keys.value) {
            state.user_settings.filters.key = _input_filter_by_keys.value
            render()
            save_user_settings()
        }
    },
    MIN_DELAY_BETWEEN_INPUT_UPDATE
)

function set_user_settings_to_controls (user_settings) {
    ['All'].concat(langs).forEach(locale => {
        const option = document.createElement('option')
        option.textContent = locale
        if (locale === user_settings.filters.locale) option.setAttribute('selected', true)
        _select_locale.appendChild(option)
    })
    _select_locale.style.display = ''
    _input_approved_by.value = user_settings.filters.approved_by
    _input_note.value = user_settings.filters.note
    _input_time_from.value = user_settings.filters.time.from
    _input_time_to.value = user_settings.filters.time.to
    _input_count_changed_keys_from.value = user_settings.filters.count_changed_keys.from
    _input_count_changed_keys_to.value = user_settings.filters.count_changed_keys.to
    _input_filter_by_values.value = user_settings.filters.value
    _input_filter_by_keys.value = user_settings.filters.key
    document.getElementById(state.user_settings.sort).classList.add('active')
}

load_history_new()
.then((pendings) => {
    state.pendings = pendings
    _pendings.style.display = ''
})
