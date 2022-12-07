/* global
msgpack
localforage
load_translations
debounce
mergeDeep
regulator
langs
_loader
_loader_container
_table
_results
_input_search
_input_replace
_input_include
_input_exclude
_input_note
_button_replace
_select_locale
_select_case_sensitive
_ul_include
_ul_exclude
_button_restore_default_settings
_count
_select_filter_mode
REGULATOR
*/

const MIN_DELAY_BETWEEN_SAVE = 2000
const MIN_DELAY_BETWEEN_INPUT_UPDATE = 200
const default_user_settings = {
    focus: '_input_search',
    note: '',
    case_sensitive: 'No',
    filter_mode: 'includes',
    filters: {
        locale: 'en',
        include: [],
        exclude: [],
        search: '',
        replace: ''
    }
}
const state = {
    translations: null,
    filtered_by_keys: {},
    prev_results: [],
    results: [],
    tr: {},
    user_settings: JSON.parse(JSON.stringify(default_user_settings))
}
const db_key_user_settings = 'user_settings (search & replace page)'
const save_user_settings = debounce(() => localforage.setItem(db_key_user_settings, msgpack.encode(state.user_settings)), MIN_DELAY_BETWEEN_SAVE)
var light = null
var last_active_filter_input = _input_include

var toFlat = (data, prefix = '') =>
    Object.keys(data).reduce((acc, el) => {
        let nextPrefix = prefix ? prefix + '.' + el : el

        if (typeof data[el] !== 'string')
            return {
                ...acc,
                ...toFlat(data[el], nextPrefix)
            }

        acc[nextPrefix] = data[el]
        return acc
    }, {})

function replace_without_case_sensitive (where, from, to) {
    return where.toLowerCase().split(from.toLowerCase()).reduce(
        (acc, _) =>
            [
                acc[0] + _.length + from.length,
                acc[1].concat(where.substring(acc[0], acc[0] + _.length))
            ],
        [0, []]
    )[1].join(to)
}

function text_search (translations, request, lang, case_sensitive) {
    const locales = lang === 'All'
        ? Object.keys(translations)
        : [lang]


    if (case_sensitive === 'Yes')
        return locales.reduce(
            (found, locale) => {
                if (translations[locale]) {
                    found[locale] = found[locale] || {}
                    return Object.keys(translations[locale]).reduce(
                        (found, key) => {
                            if (translations[locale][key].indexOf(request) !== -1)
                                found[locale][key] = translations[locale][key]
                            return found
                        },
                        found
                    )
                }
                return found
            },
            {}
        )

    request = request.toLowerCase()
    return locales.reduce(
        (found, locale) => {
            if (translations[locale]) {
                found[locale] = found[locale] || {}
                return Object.keys(translations[locale]).reduce(
                    (found, key) => {
                        if (translations[locale][key].toLowerCase().indexOf(request) !== -1)
                            found[locale][key] = translations[locale][key]
                        return found
                    },
                    found
                )
            }
            return found
        },
        {}
    )
}


function string_to_html_with_class_for_separtor (string, separator, class_name) {
    var nodes = []
    var lower_string = string.toLowerCase()
    var lower_separator = separator.toLowerCase()
    var l = lower_separator.length
    var i = 0
    var j = 0
    var span
    while (i > -1) {
        i = lower_string.indexOf(lower_separator, i)
        if (i > -1) {
            nodes.push(document.createTextNode(string.substring(j, i)))
            span = document.createElement('span')
            span.className = class_name
            span.appendChild(document.createTextNode(string.substring(i, i + l)))
            nodes.push(span)
            i += l
            j = i
        }
    }
    nodes.push(document.createTextNode(string.substring(j, string.length)))
    return nodes
}

function string_to_html_with_class_for_separtor_test () {
    return true &&
        string_to_html_with_class_for_separtor('Tel XxX-', 'TEL', 'ok') === '<span class="ok">Tel</span>&nbsp;XxX-' &&
        string_to_html_with_class_for_separtor('Tel XxX-', 'xX', 'ok') === 'Tel&nbsp;<span class="ok">Xx</span>X-' &&
        string_to_html_with_class_for_separtor('Tel XxX-XX', 'xX', 'ok') === 'Tel&nbsp;<span class="ok">Xx</span>X-<span class="ok">XX</span>' &&
        string_to_html_with_class_for_separtor('Tel XxX-XX-xx', 'xX', 'ok') === 'Tel&nbsp;<span class="ok">Xx</span>X-<span class="ok">XX</span>-<span class="ok">xx</span>' &&
        string_to_html_with_class_for_separtor('Tel XxX-XX-xx--x-X-', 'xX', 'ok') === 'Tel&nbsp;<span class="ok">Xx</span>X-<span class="ok">XX</span>-<span class="ok">xx</span>--x-X-' &&
        string_to_html_with_class_for_separtor('Tel XxX-XX-xx--x-X-xX8', 'xX', 'ok') === 'Tel&nbsp;<span class="ok">Xx</span>X-<span class="ok">XX</span>-<span class="ok">xx</span>--x-X-<span class="ok">xX</span>8'
}window.string_to_html_with_class_for_separtor_test = string_to_html_with_class_for_separtor_test

function string_to_html_with_class_for_separtor_replace (string, separator, insert, class_name) {
    var nodes = []
    var lower_string = string.toLowerCase()
    var lower_separator = separator.toLowerCase()
    var l = lower_separator.length
    var i = 0
    var j = 0
    var span
    while (i > -1) {
        i = lower_string.indexOf(lower_separator, i)
        if (i > -1) {
            nodes.push(document.createTextNode(string.substring(j, i)))
            span = document.createElement('span')
            span.className = class_name
            span.appendChild(document.createTextNode(insert))
            nodes.push(span)
            i += l
            j = i
        }
    }
    nodes.push(document.createTextNode(string.substring(j, string.length)))
    return nodes
}


_input_search.onfocus = _ => save_user_settings(state.user_settings.focus = _.target.id)
_input_replace.onfocus = _ => save_user_settings(state.user_settings.focus = _.target.id)
_input_note.onfocus = _ => save_user_settings(state.user_settings.focus = _.target.id)
_select_locale.onfocus = _ => save_user_settings(state.user_settings.focus = _.target.id)
_select_filter_mode.onfocus = _ => save_user_settings(state.user_settings.focus = _.target.id)
_select_case_sensitive.onfocus = _ => save_user_settings(state.user_settings.focus = _.target.id)
_input_include.onfocus = _ => {
    save_user_settings(state.user_settings.focus = _.target.id)
    last_active_filter_input = _input_include
}
_input_exclude.onfocus = _ => {
    save_user_settings(state.user_settings.focus = _.target.id)
    last_active_filter_input = _input_exclude
}
_select_locale.onchange = () => {
    state.user_settings.filters.locale = _select_locale.value
    state.filtered_by_keys = filter_by_keys(state.translations)
    state.prev_results = state.results
    state.results = text_search(state.filtered_by_keys, _input_search.value, _select_locale.value, state.user_settings.case_sensitive)
    render()
    save_user_settings(state.user_settings.filters.locale = _select_locale.value)
}
_results.onclick = e => {
    if (e.target.classList.contains('search-col-2'))
        last_active_filter_input.value = e.target.textContent
}
_results.onmouseover = e => {
    if (e.target.classList.contains('search-col-2') && last_active_filter_input.value === '')
        last_active_filter_input.placeholder = e.target.textContent
}
_results.onmouseout = e => {
    if (e.target.classList.contains('search-col-2'))
        last_active_filter_input.placeholder = ''
}

_input_search.onkeyup = debounce(
    () => {
        if (state.user_settings.filters.search !== _input_search.value) {
            state.user_settings.filters.search = _input_search.value
            state.prev_results = state.results
            state.results = text_search(state.filtered_by_keys, _input_search.value, _select_locale.value, state.user_settings.case_sensitive)
            render()
            save_user_settings()
        }
    },
    MIN_DELAY_BETWEEN_INPUT_UPDATE
)

_input_note.onkeyup = debounce(
    () => {
        if (state.user_settings.note !== _input_note.value) {
            state.user_settings.note = _input_note.value
            save_user_settings()
        }
    },
    MIN_DELAY_BETWEEN_INPUT_UPDATE
)

_input_replace.onkeyup = debounce(
    event => {
        state.user_settings.filters.replace = _input_replace.value
        if (_input_replace.value === '') _button_replace.setAttribute('disabled', 'disabled')
        else _button_replace.removeAttribute('disabled')
        render()
        save_user_settings()
        if (_button_replace.hasAttribute('disabled') === false && event.key === 'Enter') _button_replace.click()
    },
    MIN_DELAY_BETWEEN_INPUT_UPDATE
)

_select_case_sensitive.onchange = debounce(
    () => {
        if (state.user_settings.case_sensitive !== _select_case_sensitive.value) {
            state.user_settings.case_sensitive = _select_case_sensitive.value
            if (_input_search.value) {
                state.prev_results = state.results
                state.results = text_search(state.filtered_by_keys, _input_search.value, _select_locale.value, state.user_settings.case_sensitive)
                render()
            }
            save_user_settings()
        }
    },
    MIN_DELAY_BETWEEN_INPUT_UPDATE
)

_select_filter_mode.onchange = debounce(
    () => {
        if (state.user_settings.filter_mode !== _select_filter_mode.value) {
            state.user_settings.filter_mode = _select_filter_mode.value
            state.filtered_by_keys = filter_by_keys(state.translations)
            state.prev_results = state.results
            state.results = text_search(state.filtered_by_keys, _input_search.value, _select_locale.value, state.user_settings.case_sensitive)
            render()
            save_user_settings()
        }
    },
    MIN_DELAY_BETWEEN_INPUT_UPDATE
)

const delete_empty_locales = _ =>
    Object.keys(_).reduce(
        (o, locale) => {
            if (Object.keys(o[locale]).length === 0) delete o[locale]
            return o
        },
        _
    )

_button_replace.onclick = () => {
    _input_search.setAttribute('disabled', 'disabled')
    _input_replace.setAttribute('disabled', 'disabled')
    _input_note.setAttribute('disabled', 'disabled')
    _button_replace.setAttribute('disabled', 'disabled')
    _button_replace.innerHTML = '<b>🔃</b>'

    fetch(
        location.href.replace('/search', '/replace'),
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                note: state.user_settings.note,
                replace: {
                    from: _input_search.value,
                    to: _input_replace.value
                },
                map_lang_translations: delete_empty_locales(Object.keys(state.results).reduce(
                    (map_lang_translations, locale) => {
                        map_lang_translations[locale] = map_lang_translations[locale] || {}
                        return Object.keys(state.results[locale]).reduce(
                            (map_lang_translations, key) => {
                                map_lang_translations[locale][key] = state.user_settings.filters.search === '' && state.user_settings.filters.replace !== ''
                                    ? state.user_settings.filters.replace
                                    : _select_case_sensitive.value === 'No'
                                        ? replace_without_case_sensitive(state.results[locale][key], _input_search.value, _input_replace.value)
                                        : state.results[locale][key].split(_input_search.value).join(_input_replace.value)
                                return map_lang_translations
                            },
                            map_lang_translations
                        )
                    },
                    {}
                ))
            })
        }
    )
    .then(_ => _.json())
    .then(_ => {
        _input_search.removeAttribute('disabled')
        _input_replace.removeAttribute('disabled')
        _input_note.removeAttribute('disabled')
        _button_replace.removeAttribute('disabled')
        if (_.ok) {
            _button_replace.innerHTML = 'Create pendigns'
            _button_restore_default_settings.click()
        } else {
            _button_replace.innerHTML = 'Error: ' + _.error
        }
    })
}

function onprogress (regulator, locale) {
    _loader.textContent = 'Locale is ready: ' + locale
}

_button_restore_default_settings.onclick = () => {
    state.user_settings = JSON.parse(JSON.stringify(default_user_settings))
    set_user_settings_to_controls(state.user_settings)
    state.filtered_by_keys = filter_by_keys(state.translations)
    state.prev_results = state.results
    state.results = text_search(state.filtered_by_keys, _input_search.value, _select_locale.value, state.user_settings.case_sensitive)
    render()
    save_user_settings()
}

var light_li = null
function attach_to_ul (filter_type, ul) {
    return function (event) {
        if (event.keyCode != 13) return
        var filters = state.user_settings.filters[filter_type]
        const filter = event.target.value
        if (filters.includes(filter)) return

        setTimeout(() => {
            filters.push(filter)
            const li = document.createElement('li')
            const x = document.createElement('i')
            const p = document.createElement('p')
            x.className = 'fas fa-fw fa-times delete-filter'
            p.textContent = filter
            li.appendChild(x)
            li.appendChild(p)
            x.onclick = function remove () {
                filters.splice(filters.indexOf(filter), 1)
                ul.removeChild(li)
                state.filtered_by_keys = filter_by_keys(state.translations)
                state.prev_results = state.results
                state.results = text_search(state.filtered_by_keys, _input_search.value, _select_locale.value, state.user_settings.case_sensitive)
                render()
            }
            p.onclick = function () {
                if (light_li === li) {
                    light_li.classList.remove('light')
                    light_li = null
                } else if (light_li === null) {
                    light_li = li
                    light_li.classList.add('light')
                } else {
                    light_li.classList.remove('light')
                    light_li = li
                    light_li.classList.add('light')
                }
                light = light === filter ? null : filter
                state.filtered_by_keys = filter_by_keys(state.translations)
                state.prev_results = state.results
                state.results = text_search(state.filtered_by_keys, _input_search.value, _select_locale.value, state.user_settings.case_sensitive)
                render()
            }
            ul.insertBefore(li, ul.firstChild)
            event.target.value = ''
            state.filtered_by_keys = filter_by_keys(state.translations)
            state.prev_results = state.results
            state.results = text_search(state.filtered_by_keys, _input_search.value, _select_locale.value, state.user_settings.case_sensitive)
            render()
        }, 0)
    }
}
_input_include.onkeydown = attach_to_ul('include', _ul_include)
_input_exclude.onkeydown = attach_to_ul('exclude', _ul_exclude)

function set_user_settings_to_controls (user_settings) {
    _select_locale.innerHTML = '';
    ['All'].concat(langs).forEach(locale => {
        const option = document.createElement('option')
        option.textContent = locale
        if (locale === user_settings.filters.locale) option.setAttribute('selected', true)
        _select_locale.appendChild(option)
    })

    _select_case_sensitive.innerHTML = '';
    ['Yes', 'No'].forEach(_ => {
        const option = document.createElement('option')
        option.textContent = _
        if (_ === user_settings.case_sensitive) option.setAttribute('selected', true)
        _select_case_sensitive.appendChild(option)
    })

    _select_filter_mode.innerHTML = '';
    ['startsWith', 'includes', 'exact'].forEach(_ => {
        const option = document.createElement('option')
        option.textContent = _
        if (_ === user_settings.filter_mode) option.setAttribute('selected', true)
        _select_filter_mode.appendChild(option)
    })

    document.getElementById(user_settings.focus).focus()

    _input_search.value = user_settings.filters.search
    _input_replace.value = user_settings.filters.replace
    _input_note.value = user_settings.note

    if (user_settings.filters.replace === '') _button_replace.setAttribute('disabled', 'disabled')
    else _button_replace.removeAttribute('disabled')

    _ul_include.innerHTML = ''
    state.user_settings.filters.include.forEach(filter => {
        const li = document.createElement('li')
        const x = document.createElement('i')
        const p = document.createElement('p')
        x.className = 'fas fa-fw fa-times delete-filter'
        p.textContent = filter
        li.appendChild(x)
        li.appendChild(p)
        x.onclick = function remove () {
            state.user_settings.filters.include.splice(state.user_settings.filters.include.indexOf(filter), 1)
            _ul_include.removeChild(li)
            state.filtered_by_keys = filter_by_keys(state.translations)
            state.prev_results = state.results
            state.results = text_search(state.filtered_by_keys, _input_search.value, _select_locale.value, state.user_settings.case_sensitive)
            render()
        }
        p.onclick = function () {
            if (light_li === li) {
                light_li.classList.remove('light')
                light_li = null
            } else if (light_li === null) {
                light_li = li
                light_li.classList.add('light')
            } else {
                light_li.classList.remove('light')
                light_li = li
                light_li.classList.add('light')
            }
            light = light === filter ? null : filter
            state.filtered_by_keys = filter_by_keys(state.translations)
            state.prev_results = state.results
            state.results = text_search(state.filtered_by_keys, _input_search.value, _select_locale.value, state.user_settings.case_sensitive)
            render()
        }
        _ul_include.insertBefore(li, _ul_include.firstChild)
    })
    _ul_exclude.innerHTML = ''
    state.user_settings.filters.exclude.forEach(filter => {
        const li = document.createElement('li')
        const x = document.createElement('i')
        const p = document.createElement('p')
        x.className = 'fas fa-fw fa-times delete-filter'
        p.textContent = filter
        li.appendChild(x)
        li.appendChild(p)
        x.onclick = function remove () {
            state.user_settings.filters.exclude.splice(state.user_settings.filters.exclude.indexOf(filter), 1)
            _ul_exclude.removeChild(li)
            state.filtered_by_keys = filter_by_keys(state.translations)
            state.prev_results = state.results
            state.results = text_search(state.filtered_by_keys, _input_search.value, _select_locale.value, state.user_settings.case_sensitive)
            render()
        }
        p.onclick = function () {
            if (light_li === li) {
                light_li.classList.remove('light')
                light_li = null
            } else if (light_li === null) {
                light_li = li
                light_li.classList.add('light')
            } else {
                light_li.classList.remove('light')
                light_li = li
                light_li.classList.add('light')
            }
            light = light === filter ? null : filter
            state.filtered_by_keys = filter_by_keys(state.translations)
            state.prev_results = state.results
            state.results = text_search(state.filtered_by_keys, _input_search.value, _select_locale.value, state.user_settings.case_sensitive)
            render()
        }
        _ul_exclude.insertBefore(li, _ul_exclude.firstChild)
    })
}

function create_tr_template () {
    const tr = document.createElement('tr')
    const td_lang = document.createElement('td')
    const td_key = document.createElement('td')
    const td_val = document.createElement('td')
    const td_links = document.createElement('td')
    const b = document.createElement('b')
    const a = document.createElement('a')
    td_links.appendChild(b)
    td_links.appendChild(a)
    td_lang.className = 'search-col-1'
    td_key.className = 'search-col-2'
    td_val.className = 'search-col-3'
    td_links.className = 'search-col-4'
    tr.appendChild(td_lang)
    tr.appendChild(td_key)
    tr.appendChild(td_val)
    tr.appendChild(td_links)
    tr.style.display = 'none'
    return tr
}

const tr_template = create_tr_template()

function create_tr_for_locale_and_key (locale, key) {
    state.tr[locale] = state.tr[locale] || {}
    const tr = tr_template.cloneNode(true)
    tr.children[0].textContent = locale
    tr.children[1].textContent = key
    const links = state.page_by_key[key]
    if (links) {
        const len = links.length
        var i = 0
        tr.children[3].firstChild.textContent = (i + 1) + '/' + len
        tr.children[3].lastChild.textContent = links[i]
        tr.children[3].lastChild.href = '//' + location.host + '/' + REGULATOR + '/' + locale + '/' + links[i]
        tr.children[3].onwheel = e => {
            e.preventDefault()
            i += e.deltaY > 0 ? 1 : -1
            if (i < 0) i = len - 1
            i %= len
            tr.children[3].firstChild.textContent = (i + 1) + '/' + len
            tr.children[3].lastChild.textContent = links[i]
            tr.children[3].lastChild.href = '//' + location.host + '/' + REGULATOR + '/' + locale + '/' + links[i]
        }
    }
    state.tr[locale][key] = tr
    return tr
}

function render () {
    if (_ul_include.childElementCount === 0 && _input_search.value === '') {
        state.results = []
        document.getElementById(state.user_settings.focus).focus()
    }

    _count.textContent = Object.keys(state.results).reduce((n, locale) => n + Object.keys(state.results[locale]).length, 0)

    Object.keys(state.prev_results).forEach(locale => {
        if (state.results[locale] === undefined) {
            Object.keys(state.prev_results[locale]).forEach(key =>
                state.tr[locale][key].style.display = 'none'
            )
        } else {
            Object.keys(state.prev_results[locale]).forEach(key => {
                if (state.results[locale][key] === undefined)
                    state.tr[locale][key].style.display = 'none'
            })
        }
    })

    Object.keys(state.results).forEach(locale =>
        Object.keys(state.results[locale]).forEach(key => {
            const tr = state.tr[locale][key]
            const td_val = tr.children[2]
            const td_key = tr.children[1]
            const val = state.results[locale][key]
            tr.style.display = ''
            td_key.classList.toggle('light', key.includes(light))
            if (state.user_settings.filters.search === '') {
                if (state.user_settings.filters.replace === '') {
                    td_val.innerText = val
                } else {
                    td_val.innerHTML = ''
                    const span = document.createElement('span')
                    span.className = 'replaced'
                    span.appendChild(document.createTextNode(state.user_settings.filters.replace))
                    td_val.appendChild(span)
                }
            } else if (state.user_settings.filters.replace === '') {
                td_val.innerHTML = ''
                if (state.user_settings.case_sensitive === 'No') {
                    string_to_html_with_class_for_separtor(val, state.user_settings.filters.search, 'searched').forEach(node =>
                        td_val.appendChild(node)
                    )
                } else {
                    val.split(state.user_settings.filters.search).map(_ => document.createTextNode(_)).forEach((node, not_first) => {
                        if (not_first) {
                            const span = document.createElement('span')
                            span.className = 'searched'
                            span.appendChild(document.createTextNode(state.user_settings.filters.search))
                            td_val.appendChild(span)
                        }
                        td_val.appendChild(node)
                    })
                }
            } else {
                td_val.innerHTML = ''
                if (state.user_settings.case_sensitive === 'No') {
                    string_to_html_with_class_for_separtor_replace(val, state.user_settings.filters.search, state.user_settings.filters.replace, 'replaced').forEach(node =>
                        td_val.appendChild(node)
                    )
                } else {
                    val.split(state.user_settings.filters.search).map(_ => document.createTextNode(_)).forEach((node, not_first) => {
                        if (not_first) {
                            const span = document.createElement('span')
                            span.className = 'replaced'
                            span.appendChild(document.createTextNode(state.user_settings.filters.replace))
                            td_val.appendChild(span)
                        }
                        td_val.appendChild(node)
                    })
                }
            }
        })
    )
}

function render_all (translations) {
    const fragment = document.createDocumentFragment()
    Object.keys(translations).forEach(locale =>
        Object.keys(translations[locale]).forEach(key =>
            fragment.appendChild(create_tr_for_locale_and_key(locale, key))
        )
    )
    _results.appendChild(fragment)
    return translations
}

function filter_by_keys (translations) {
    return (
        state.user_settings.filters.locale === 'All'
            ? Object.keys(translations)
            : [state.user_settings.filters.locale]
        ).reduce(
            (acc, locale) => {
                const filtered = Object.keys(translations[locale])
                    .filter(function include_filter_for_keys (key) {
                        return state.user_settings.filters.include.length === 0 || Boolean(state.user_settings.filters.include.find(
                            state.user_settings.filter_mode === 'exact'
                                ? function exact (filter) {return key === filter}
                                : state.user_settings.filter_mode === 'includes'
                                    ? function includes (filter) {return key.includes(filter)}
                                    : state.user_settings.filter_mode === 'startsWith'
                                        ? function startsWith (filter) {return key.startsWith(filter)}
                                        : () => false
                        ))
                    })
                    .filter(function exclude_filter_for_keys (key) {
                        return state.user_settings.filters.exclude.length === 0 || !state.user_settings.filters.exclude.find(
                            state.user_settings.filter_mode === 'exact'
                                ? function exact (filter) {return key === filter}
                                : state.user_settings.filter_mode === 'includes'
                                    ? function includes (filter) {return key.includes(filter)}
                                    : state.user_settings.filter_mode === 'startsWith'
                                        ? function startsWith (filter) {return key.startsWith(filter)}
                                        : () => false
                        )
                    })

                if (filtered.length) {
                    acc[locale] = filtered.reduce(
                        (_, key) => {
                            _[key] = translations[locale][key]
                            return _
                        },
                        {}
                    )
                }
                return acc
            },
            {}
        )
}
fetch(location.href.replace('search', 'page_by_key'), {method: 'POST'})
    .then(_ => _.arrayBuffer())
    .then(_ => msgpack.decode(new Uint8Array(_)))
    .then(_ => state.page_by_key = _)
    .then(() =>
Promise.all([
    load_translations([regulator], langs, onprogress)
        .then(translations => {
            _loader_container.parentElement.appendChild(document.createTextNode('Replace operation should create new pendings by selected languages.'))
            _loader_container.parentElement.removeChild(_loader_container)
            return translations[regulator]
        })
        .then(translations =>
            Object.keys(translations).reduce(
                (_, locale) => {
                    _[locale] = toFlat(translations[locale])
                    return _
                },
                translations
            )
        )
        .then(render_all)
        .then(translations =>
            new Promise(y => {
                window.requestAnimationFrame(() => setTimeout(() => _table.style.display = 'table', 0))
                y(translations)
            })
        ),
    new Promise(_ => localforage.ready(_))
        .then(() => localforage.getItem(db_key_user_settings))
        .then(_ =>
            _
                ? msgpack.decode(_)
                : null
        )
])
        .then(([translations, user_settings]) => {
            state.translations = translations
            if (user_settings) state.user_settings = mergeDeep(state.user_settings, user_settings)
            set_user_settings_to_controls(state.user_settings)
            state.filtered_by_keys = filter_by_keys(state.translations)
            state.prev_results = []
            state.results = text_search(state.filtered_by_keys, _input_search.value, _select_locale.value, state.user_settings.case_sensitive)
            render()
        })
)
