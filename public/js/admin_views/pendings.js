/* global
msgpack
load_translations
REGULATOR
regulator
_count
_pendings
_button_approve_checked
_button_dismiss_checked
_button_create_token
_label_count
_title
_bulk_check_all
_title_time
langs
*/
const main_container = document.getElementsByClassName('card-body')[0]
const state = {
    checked: [],
    checkboxes_elements: [],
    translations: {},
    pendings: []
}

function get_leave_value_by_path (tree, path) {
    const careers = path.startsWith('careers.')
    const keys = path.split('.')
    return keys.reduce(
        (node, key, i) => {
            if (node[key] === undefined && careers)
                i == keys.length - 1
                    ? (node[key] = '')
                    : node[key] = {}
            return node[key]
        },
        tree
    )
}

function gen_diffs (current, changes) {
    if (current['careers'] === undefined) current['careers'] = {}//new branch created from etalon(*.json) do not have careers
    return changes
        ?
            Object.keys(changes)
            .map(path => [
                path,
                get_leave_value_by_path(current, path),
                changes[path]
            ])
            .filter(_ => _[1] !== _[2])
        :
            []
}

function pending_checkbox (pending) {
    const td = document.createElement('td')
    const div = document.createElement('div')
    const input = document.createElement('input')
    const keys = Object.keys(pending.translations)

    input.setAttribute('type', 'checkbox')
    input.className = 'form-check-input bulk-check'
    input.onclick = () => {
        if (state.checked.includes(pending)) {
            state.checked.splice(state.checked.findIndex(_ => _ === pending), 1)
        } else {
            input.checked = !state.checked.find(_ => _.locale === pending.locale && keys.find(key => _.translations[key]))
            if (input.checked) {
                state.checked.push(pending)
                pending.tr_pending.classList.remove('key_intersection')
                pending.tr_pending.removeAttribute('title')
            } else {
                pending.tr_pending.classList.add('key_intersection')
                pending.tr_pending.setAttribute('title', 'There is same key with other checked pending (same locale)')
            }
        }
    }
    state.checkboxes_elements.push(input)
    div.className = 'form-group form-check'
    div.appendChild(input)
    td.appendChild(div)

    return td
}

function pending_lang (pending) {
    const td = document.createElement('td')

    td.textContent = pending.locale.toUpperCase()

    return td
}

function pending_time (pending) {
    const td = document.createElement('td')

    td.textContent = new Date(pending.update_times[pending.update_times.length - 1]).toISOString()

    return td
}

function pending_note (pending) {
    const td = document.createElement('td')

    td.textContent = pending.note

    return td
}

function pending_keys (pending) {
    const td = document.createElement('td')

    td.textContent = Object.keys(pending.translations).length

    return td
}

function remove_pending_after_ok_from_server (pending) {
    if (state.checked.includes(pending)) {
        state.checked.splice(state.checked.findIndex(_ => _ === pending), 1)
    }
    _pendings.removeChild(pending.tr_pending)
    _pendings.removeChild(pending.tr_pending_diff)
    state.pendings.splice(state.pendings.findIndex(_ => _ === pending), 1)
    _count.textContent = Number(_count.textContent) - 1
}

function approve_pending (pending) {
    pending.button_approve.setAttribute('disabled', 'disabled')
    pending.button_dismiss.setAttribute('disabled', 'disabled')
    pending.tr_pending.classList.add('approving')
    pending.button_approve.innerHTML = '<b>🔃</b>'
    return fetch(
        location.href.replace('pending', 'approve'),
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                token: pending.token,
                locale: pending.locale,
                note: pending.note
            })
        }
    )
        .then(res => res.json())
        .then((e) => {
            remove_pending_after_ok_from_server(pending)
            console.log('pending e',e)
        })
        .catch(e => console.log(e))
}

function dismiss_pending (pending) {
    pending.button_approve.setAttribute('disabled', 'disabled')
    pending.button_dismiss.setAttribute('disabled', 'disabled')
    pending.tr_pending.classList.add('dismissing')
    pending.button_dismiss.innerHTML = '<b>🔃</b>'
    return fetch(
        location.href.replace('pending', 'dismiss'),
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                token: pending.token,
                locale: pending.locale
            })
        }
    )
        .then(() => remove_pending_after_ok_from_server(pending))
        .catch(e => alert(e))
}

function pending_controls (pending, tr_pending, tr_pending_diff) {
    const td = document.createElement('td')
    const button_approve = document.createElement('button')
    const button_dismiss = document.createElement('button')
    const button_diff = document.createElement('button')
    const a_export = document.createElement('a')

    pending.tr_pending = tr_pending
    pending.tr_pending_diff = tr_pending_diff
    pending.button_approve = button_approve
    pending.button_dismiss = button_dismiss

    td.classList.add('button-container')


    button_diff.setAttribute('disabled', 'disabled')
    button_diff.className = 'btn btn-sm btn-info diff'
    button_diff.textContent = 'Diff'
    button_diff.onclick = () =>
        tr_pending_diff.style.display = tr_pending_diff.style.display === 'none'
            ? ''
            : 'none'
    td.appendChild(button_diff)


    button_approve.setAttribute('role', 'button')
    button_approve.setAttribute('disabled', 'disabled')
    button_approve.className = 'btn btn-sm btn-success approve'
    button_approve.textContent = 'Approve'
    button_approve.onclick = function () {
        if (!confirm('Approve suggested translation for ' + pending.locale + ': ' + pending.note)) return
        approve_pending(pending)
    }
    td.appendChild(button_approve)


    button_dismiss.setAttribute('role', 'button')
    button_dismiss.className = 'btn btn-sm btn-danger dismiss'
    button_dismiss.textContent = 'Dismiss'
    button_dismiss.onclick = function () {
        if (!confirm('Dismiss suggested translation for ' + pending.locale + ': ' + pending.note)) return
        dismiss_pending(pending)
    }
    td.appendChild(button_dismiss)


    a_export.className = 'btn btn-sm btn-warning export-single'
    a_export.textContent = 'Export'
    a_export.setAttribute('target', '_blank')
    a_export.setAttribute('download', ['icmarkets', 'pending', 'translation', REGULATOR, pending.locale, Date.now()].join('-') + '.json')
    setTimeout(() => {
        a_export.href = URL.createObjectURL(
            new Blob([JSON.stringify(pending.translations, null, 4)], {type: 'application/json'})
        )
    }, 0)
    td.appendChild(a_export)


    return [td, [button_diff, button_approve]]
}

function create_element_pending_diff (pending, count_columns, controls) {
    const td = document.createElement('td')
    td.setAttribute('colspan', String(count_columns))

    translations_ready.then(() => {
        const table = document.createElement('table')
        table.setAttribute('border', '1')
        table.style = 'width:100%;'
        table.className = 'diff-table'

        const thead = document.createElement('thead')
        thead.style = 'background:#999; color:#fff;'
        thead.innerHTML = `
            <tr>
                <th width="150">Key</th>
                <th>Current</th>
                <th>Changes</th>
            </tr>`

        const tbody = document.createElement('tbody')

        pending.diffs = pending.diffs || gen_diffs(state.translations[regulator][pending.locale], pending.translations)
        if (pending.diffs.length > 0) {
            controls.forEach(_ => _.removeAttribute('disabled'))
            pending.diffs.forEach(diff => {
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
        }

        table.appendChild(thead)
        table.appendChild(tbody)
        td.appendChild(table)
    })
    return td
}

function onprogress (regulator, lang) {
    _title.textContent = 'Loading pendings ' + regulator + ' ' + lang
}

function render () {
    if (state.pendings.length === 0) return main_container.innerHTML = 'No pending translations'
    _count.textContent = state.pendings.length

    _pendings.innerHTML = ''
    state.checkboxes_elements = []

    state.pendings.forEach(pending => {
        const tr_pending = document.createElement('tr')
        const tr_pending_diff = document.createElement('tr')

        tr_pending_diff.style = 'display: none;'

        const pending_checkbox_element = pending_checkbox(pending)
        const pending_time_element = pending_time(pending)
        const pending_lang_element = pending_lang(pending)
        const pending_note_element = pending_note(pending)
        const pending_keys_element = pending_keys(pending)
        const [pending_controls_element, controls] = pending_controls(pending, tr_pending, tr_pending_diff)

        const elements = [
            pending_checkbox_element,
            pending_time_element,
            pending_lang_element,
            pending_note_element,
            pending_keys_element,
            pending_controls_element
        ]

        const count_columns = elements.length

        tr_pending_diff.appendChild(create_element_pending_diff(pending, count_columns, controls))

        elements.forEach(_ => tr_pending.appendChild(_))

        _pendings.appendChild(tr_pending)
        _pendings.appendChild(tr_pending_diff)
    })
}

function sort_by_last_update () {
    state.pendings = state.pendings.sort((a, b) =>
        b.update_times[b.update_times.length - 1] - a.update_times[a.update_times.length - 1]
    )
}

function sort_by_time_from_past_to_now (pendings) {
    return pendings.sort((a, b) =>
        a.update_times[b.update_times.length - 1] - b.update_times[a.update_times.length - 1]
    )
}

function sort_by_first_update () {
    state.pendings = state.pendings.sort((b, a) =>
        b.update_times[b.update_times.length - 1] - a.update_times[a.update_times.length - 1]
    )
}

function load_pendings() {
    return fetch(location.href, {method: 'POST'})
        .then(_ => _.arrayBuffer())
        .then(_ => msgpack.decode(new Uint8Array(_)))
        .then(_ =>
            Object.keys(_).reduce(
                (pendings, locale) =>
                    pendings.concat(
                        Object.values(_[locale])
                            .map(_ => msgpack.decode(_))
                    ),
                []
            )
        )
}

const translations_ready = load_translations(
    [regulator],
    langs,
    onprogress
)
    .then(translations => {
        state.translations = translations
        _title.textContent = 'Pending applied translations'
    })

load_pendings()
    .then(pendings => {
        _label_count.style.display = ''

        state.pendings = pendings

        sort_by_last_update()
        render()
    })


_bulk_check_all.onclick = () => state.checkboxes_elements.reverse().forEach(_ => _.click())

function copy_to_clipboard (text) {
    return navigator.permissions.query({name: "clipboard-write"}).then(status => {
        if (status.state === 'denied')
            return prompt('Copy authorization link', text);
        status.onchange = () => navigator.clipboard.writeText(text)
        status.onchange()
    })
}

_button_approve_checked.onclick = function () {
    if (!confirm('This action will approve selected pending translations.')) return

    _button_approve_checked.setAttribute('disabled', 'disabled')
    _button_dismiss_checked.setAttribute('disabled', 'disabled')
    _button_approve_checked.innerHTML = '<b>🔃</b>'

    sort_by_time_from_past_to_now(state.checked).reduce(
        (chain, pending) => chain.then(() => approve_pending(pending)),
        Promise.resolve()
    )
        .then(() => {
            _button_dismiss_checked.removeAttribute('disabled')
            _button_approve_checked.removeAttribute('disabled')
            _button_approve_checked.innerHTML = 'Approve checked'
        })
}

_button_dismiss_checked.onclick = () => {
    if (!confirm('This action will dismiss selected pending translations.')) return

    _button_approve_checked.setAttribute('disabled', 'disabled')
    _button_dismiss_checked.setAttribute('disabled', 'disabled')
    _button_dismiss_checked.innerHTML = '<b>🔃</b>'

    Promise.all(state.checked.map(dismiss_pending))
        .then(() => {
            _button_dismiss_checked.removeAttribute('disabled')
            _button_approve_checked.removeAttribute('disabled')
            _button_dismiss_checked.innerHTML = 'Dismiss checked'
        })
}

var create_token_value = _button_create_token.textContent
_button_create_token.textContent = create_token_value
_button_create_token.onclick = () => {
    const note = prompt('Suggestion Note:')
    note === null || fetch(
        location.href.replace('pending', 'create_translator'),
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                note
            })
        }
    )
        .then(b => b.ok ? b.json() : Promise.reject(new Error(b.statusText)))
        .then(json => json.token)
        .then(token => location.href.replace('admin/pending', 'translator/login?translator_token=' + token))
        .then(link_to_translator => {
            copy_to_clipboard(link_to_translator)
            _button_create_token.textContent = '-> Saved at ClipBoard <-'
            setTimeout(() => _button_create_token.textContent = create_token_value, 1000)
        })
}

const direction = {
    time: false
}
_title_time.onclick = () => {
    if (direction.time)
        sort_by_last_update()
    else
        sort_by_first_update()

    direction.time = !direction.time
    render()
}
