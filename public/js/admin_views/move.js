/* global
langs
regulators
debounce
sanitizeHTML
load_translations
mergeDeep
localforage
msgpack
_loading_translations_regulator
_loading_translations_lang
_select_regulator_from
_select_regulator_to
_select_lang_from
_select_lang_to
_input_include
_input_search
_input_replace
_input_include
_input_exclude
_input_note
_ul_move_keys
_ul_include
_ul_exclude
_button_move
_button_restore_default_settings
*/

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
const SHOULD_REPLACE = true
const SHOULD_DISABLE_IF = true
const MIN_DELAY_BETWEEN_SAVE = 2000
const MIN_DELAY_BETWEEN_INPUT_UPDATE = 200
const flat_delta_caches = {}
var flat_delta
var keys_with_filters

const default_user_settings = {
    focus: '_select_regulator_from',
    note: '',
    active_input_include_or_exclude: '_input_include',
    regulator: {
        from: 'asic',
        to: 'asic'
    },
    lang: {
        from: 'All',
        to: 'All'
    },
    filters: {
        include: [],
        exclude: [],
        search: '',
        replace: ''
    }
}
const db_key_user_settings = 'user_settings (move)'
const state = {
    translations: {},
    translations_loaded: false,
    user_settings: JSON.parse(JSON.stringify(default_user_settings))
}
const save_user_settings = debounce(() => localforage.setItem(db_key_user_settings, msgpack.encode(state.user_settings)), MIN_DELAY_BETWEEN_SAVE)
var payload
var light

function update_keys_with_filters () {
    keys_with_filters = Object.keys(flat_delta)
        .reduce(
            (keys_with_filters, lang) => {
                const filtered = Object.keys(flat_delta[lang])
                    .filter(function include_filter_for_keys (key) {
                        return state.user_settings.filters.include.length === 0 || Boolean(state.user_settings.filters.include.find(filter => key.startsWith(filter)))
                    })
                    .filter(function exclude_filter_for_keys (key) {
                        return state.user_settings.filters.exclude.length === 0 || !state.user_settings.filters.exclude.find(filter => key.startsWith(filter))
                    })

                if (filtered.length) keys_with_filters[lang] = filtered
                return keys_with_filters
            },
            {}
        )

    payload = Object.keys(keys_with_filters)
        .reduce(
            (payload, lang) => {
                payload[lang] = keys_with_filters[lang].reduce(
                    (_, key) => {
                        _[key] = (SHOULD_REPLACE &&
                            state.user_settings.filters.search !== '' &&
                            state.user_settings.filters.replace !== state.user_settings.filters.search
                        )
                            ? flat_delta[lang][key].split(state.user_settings.filters.search).join(state.user_settings.filters.replace)
                            : flat_delta[lang][key]
                        return _
                    },
                    {}
                )
                return payload
            },
            {}
        )
}

function string_to_html_with_class_for_separtor (string, separator, class_name) {
    return string.split(separator)
        .map(sanitizeHTML)
        .map(_ => _.replace(/\s/g, '&nbsp;'))
        .join('<span class="' + class_name + '">' + separator.replace(/\s/g, '&nbsp;') + '</span>')
}

function string_to_html_with_class_for_separtor_replace (string, separator, insert, class_name) {
    return string.split(separator)
        .map(sanitizeHTML)
        .map(_ => _.replace(/\s/g, '&nbsp;'))
        .join('<span class="' + class_name + '">' + insert.replace(/\s/g, '&nbsp;') + '</span>')
}

function render_keys_with_filters () {
    _ul_move_keys.innerHTML = ''
    var count_keys = 0
    var count_keys_with_replace = 0
    var count_new_pendings = Object.keys(payload).length
    Object.keys(payload).forEach(lang => {Object.keys(payload[lang]).forEach(key => {
        count_keys++
        const li = document.createElement('li')
        const div_key_and_lang = document.createElement('div')
        const div_lang = document.createElement('div')
        div_key_and_lang.className = 'key-and-lang'

        div_lang.textContent = lang
        div_lang.className = 'key-lang'

        div_key_and_lang.appendChild(div_lang)

        const div_key = document.createElement('div')

        div_key.textContent = key
        div_key.className = 'key'
        div_key_and_lang.appendChild(div_key)

        const div_value = document.createElement('div')

        div_value.textContent = state.user_settings.filters.search && flat_delta[lang][key].includes(state.user_settings.filters.search)
            ? flat_delta[lang][key].split(state.user_settings.filters.search).join(state.user_settings.filters.replace)
            : flat_delta[lang][key]
        div_value.className = 'value'
        div_value.style.display = 'none'
        div_key_and_lang.appendChild(div_value)

        li.appendChild(div_key_and_lang)

        if (state.user_settings.filters.search && flat_delta[lang][key].includes(state.user_settings.filters.search)) {
            const div_value_searched = document.createElement('div')
            const div_value_replaced = document.createElement('div')

            div_value_searched.innerHTML = string_to_html_with_class_for_separtor(flat_delta[lang][key], state.user_settings.filters.search, 'replace-from')
            div_value_replaced.innerHTML = string_to_html_with_class_for_separtor_replace(flat_delta[lang][key], state.user_settings.filters.search, state.user_settings.filters.replace, 'replace-to')

            div_value_searched.className = 'value_searched'
            div_value_replaced.className = 'value_replaced'

            li.appendChild(div_value_searched)
            li.appendChild(div_value_replaced)

            count_keys_with_replace++
        }

        li.classList.toggle('light', Boolean(light) && key.startsWith(light))
        li.onclick = () =>
            document.getElementById(state.user_settings.active_input_include_or_exclude).value = key
        li.ondblclick = () =>
            div_value.style.display === 'none'
                ? div_value.style.display = ''
                : div_value.style.display = 'none'
        li.onmouseover = () =>
            document.getElementById(state.user_settings.active_input_include_or_exclude).setAttribute('placeholder', key)
        li.onmouseout = () =>
            document.getElementById(state.user_settings.active_input_include_or_exclude).removeAttribute('placeholder')
        _ul_move_keys.appendChild(li)
    })})
    _button_move.innerHTML = [
        'Create',
        count_new_pendings,
        count_new_pendings === 1 ? 'pending' : 'pendings',
        Object.keys(payload).length === 1 ? 'by locale' : Object.keys(payload).length > 0 ? 'by locales' : '',
        Object.keys(payload).join(', '),
        'with',
        count_keys,
        count_keys === 1 ? 'key' : 'keys',
        count_keys_with_replace
            ? ' (' + count_keys_with_replace + ' replaced)'
            : '',
        'in total'
    ].join(' ')
}

function on_reselect_lang_regulator () {
    const {regulator, lang} = state.user_settings

    _button_move.setAttribute('disabled', 'disabled')
    _button_move.innerHTML = '<b>🔃</b>'

    setTimeout(() => {

    flat_delta_caches[regulator.from] = flat_delta_caches[regulator.from] || {}
    flat_delta_caches[regulator.from][regulator.to] = flat_delta_caches[regulator.from][regulator.to] || {}
    flat_delta = lang.from === 'All'
        ? lang.to === 'All'
            ? regulator.from === regulator.to
                ? {}
                : langs.reduce(
                    (flat_delta, l) => {
                        flat_delta_caches[regulator.from][regulator.to][l] = flat_delta_caches[regulator.from][regulator.to][l] || {}
                        flat_delta_caches[regulator.from][regulator.to][l][l] = flat_delta_caches[regulator.from][regulator.to][l][l] || get_flat_delta(regulator, {from: l, to: l})
                        flat_delta[l] = flat_delta_caches[regulator.from][regulator.to][l][l]
                        return flat_delta
                    },
                    {})
            : {}
        : lang.to === 'All'
            ? langs.reduce(
                (flat_delta, l) => {
                    flat_delta_caches[regulator.from][regulator.to][lang.from] = flat_delta_caches[regulator.from][regulator.to][lang.from] || {}
                    flat_delta_caches[regulator.from][regulator.to][lang.from][l] = flat_delta_caches[regulator.from][regulator.to][lang.from][l] || get_flat_delta(regulator, {from: lang.from, to: l})
                    flat_delta[l] = flat_delta_caches[regulator.from][regulator.to][lang.from][l]
                    return flat_delta
                },
                {})
            : [lang.to].reduce(
                (flat_delta, l) => {
                    flat_delta_caches[regulator.from][regulator.to][lang.from] = flat_delta_caches[regulator.from][regulator.to][lang.from] || {}
                    flat_delta_caches[regulator.from][regulator.to][lang.from][l] = flat_delta_caches[regulator.from][regulator.to][lang.from][l] || get_flat_delta(regulator, {from: lang.from, to: l})
                    flat_delta[l] = flat_delta_caches[regulator.from][regulator.to][lang.from][l]
                    return flat_delta
                },
                {})

    update_keys_with_filters()
    render_keys_with_filters();

    reset_to_buisness_state_move_botton()
    }, 0)
}

function reset_to_buisness_state_move_botton () {

    _button_move.classList.remove('btn-success')

    const {regulator, lang} = state.user_settings;

    (SHOULD_DISABLE_IF &&
        regulator.from === regulator.to
            ? lang.from === 'All'
                ? true
                : lang.from === lang.to
            : lang.from === 'All' && lang.to !== 'All'
    ) ||
    (SHOULD_DISABLE_IF &&
        state.translations_loaded === false
    )
        ? _button_move.setAttribute('disabled', 'disabled')
        : _button_move.removeAttribute('disabled')
}

function onupdate_during_loading_translations (regulator, lang) {
    _loading_translations_regulator.textContent = regulator
    _loading_translations_lang.textContent = lang
}

Promise.all([
    load_translations(regulators, langs, onupdate_during_loading_translations),
    new Promise(_ => localforage.ready(_))
        .then(() => localforage.getItem(db_key_user_settings))
        .then(_ =>
            _
                ? msgpack.decode(_)
                : null
        )
        .then(set_user_settings_to_controls)
]).then(([translations]) => {
    state.translations = translations
    state.translations_loaded = true
    _select_regulator_from.removeAttribute('disabled')
    _select_regulator_to.removeAttribute('disabled')
    _select_lang_from.removeAttribute('disabled')
    _select_lang_to.removeAttribute('disabled')
    _button_move.innerHTML = 'Move'
    on_reselect_lang_regulator()
})

_select_regulator_from.onchange = () => {
    if (state.user_settings.regulator.from !== _select_regulator_from.value) {
        state.user_settings.regulator.from = _select_regulator_from.value
        on_reselect_lang_regulator()
        save_user_settings()
    }
}
_select_regulator_to.onchange = () => {
   if (state.user_settings.regulator.to !== _select_regulator_to.value) {
       state.user_settings.regulator.to = _select_regulator_to.value
       on_reselect_lang_regulator()
       save_user_settings()
   }
}
_select_lang_from.onchange = () => {
   if (state.user_settings.lang.from !== _select_lang_from.value) {
       state.user_settings.lang.from = _select_lang_from.value
       on_reselect_lang_regulator()
       save_user_settings()
   }
}
_select_lang_to.onchange = () => {
   if (state.user_settings.lang.to !== _select_lang_to.value) {
       state.user_settings.lang.to = _select_lang_to.value
       on_reselect_lang_regulator()
       save_user_settings()
   }
}

_select_regulator_from.onfocus = _ => save_user_settings(state.user_settings.focus = _.target.id)
_select_regulator_to.onfocus = _ => save_user_settings(state.user_settings.focus = _.target.id)
_select_lang_from.onfocus = _ => save_user_settings(state.user_settings.focus = _.target.id)
_select_lang_to.onfocus = _ => save_user_settings(state.user_settings.focus = _.target.id)
_input_note.onfocus = _ => save_user_settings(state.user_settings.focus = _.target.id)
_input_search.onfocus = _ => save_user_settings(state.user_settings.focus = _.target.id)
_input_replace.onfocus = _ => save_user_settings(state.user_settings.focus = _.target.id)
_input_include.onfocus = _ => {
    state.user_settings.active_input_include_or_exclude = _.target.id
    state.user_settings.focus = _.target.id
    save_user_settings()
}
_input_exclude.onfocus = _ => {
    state.user_settings.active_input_include_or_exclude = _.target.id
    state.user_settings.focus = _.target.id
    save_user_settings()
}

function draw_filter (filter, filters, ul) {
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
        update_keys_with_filters()
        render_keys_with_filters()
        save_user_settings()
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
        render_keys_with_filters()
    }
    ul.insertBefore(li, ul.firstChild)
}

var light_li = null
function attach_to_ul (direction, ul) {
    return function (event) {
        if (event.keyCode != 13) return
        const filter = event.target.value
        if (state.user_settings.filters[direction].includes(filter)) return

        _button_move.setAttribute('disabled', 'disabled')
        _button_move.innerHTML = '<b>🔃</b>'

        setTimeout(() => {
            state.user_settings.filters[direction].push(filter)
            draw_filter(filter, state.user_settings.filters[direction], ul)
            event.target.value = ''
            update_keys_with_filters()
            render_keys_with_filters()
            reset_to_buisness_state_move_botton()
            save_user_settings()
        }, 0)
    }
}
_input_include.onkeydown = attach_to_ul('include', _ul_include)
_input_exclude.onkeydown = attach_to_ul('exclude', _ul_exclude)

function redraw_results_by_search_replace () {
    _button_move.setAttribute('disabled', 'disabled')
    _button_move.innerHTML = '<b>🔃</b>'
    setTimeout(() => {
        update_keys_with_filters()
        render_keys_with_filters()
        reset_to_buisness_state_move_botton()
    }, 0)
}

_input_search.onkeyup = debounce(
    () => {
        if (state.user_settings.filters.search !== _input_search.value) {
            state.user_settings.filters.search = _input_search.value
            redraw_results_by_search_replace()
            save_user_settings()
        }
    },
    MIN_DELAY_BETWEEN_INPUT_UPDATE
)
_input_replace.onkeyup = debounce(
    () => {
        if (state.user_settings.filters.replace !== _input_replace.value) {
            state.user_settings.filters.replace = _input_replace.value
            redraw_results_by_search_replace()
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

_button_restore_default_settings.onclick = () => {
    _ul_move_keys.innerHTML = ''
    state.user_settings = JSON.parse(JSON.stringify(default_user_settings))
    set_user_settings_to_controls(state.user_settings)
    save_user_settings()
}

_button_move.onclick = () => {
    _button_move.setAttribute('disabled', 'disabled')
    _button_move.innerHTML = '<b>🔃</b>'
    fetch(
        location.href,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                regulator: state.user_settings.regulator,
                lang: state.user_settings.lang,
                note: state.user_settings.note,
                changes: payload
            })
        }
    )
        .then(_ => _.ok)
        .then(() => {
            _button_move.classList.add('btn-success')
            const count_new_pendings = Object.keys(payload).length
            _button_move.innerHTML = [
                'Done.',
                count_new_pendings,
                'new pending' + (count_new_pendings === 1 ? '' : 's'),
                'waiting for check and approve at pendings page.'
            ].join(' ')
            _ul_move_keys.innerHTML = ''

        })
        .catch(error => {
            _button_move.classList.add('btn-error')
            alert(error.message || error)
            _button_move.classList.remove('btn-error')
            on_reselect_lang_regulator()
            _button_move.innerHTML = 'Move'
        })
}

const to_flat_cache = {}
function to_flat_with_cache (regulator, lang) {
    to_flat_cache[regulator] = to_flat_cache[regulator] || {}
    to_flat_cache[regulator][lang] = to_flat_cache[regulator][lang] || toFlat(state.translations[regulator][lang])
    return to_flat_cache[regulator][lang]
}

function get_flat_delta (regulator, lang) {
    const from = to_flat_with_cache(regulator.from, lang.from)
    const to = to_flat_with_cache(regulator.to, lang.to)
    return Object.keys(from).reduce(
        (diff, key) => {
            if (to[key] !== from[key] && key !== 'ver') diff[key] = from[key]
            return diff
        },
        {}
    )
}

function set_user_settings_to_controls (user_settings) {
    if (user_settings) state.user_settings = mergeDeep(state.user_settings, user_settings)
    user_settings = state.user_settings

    document.getElementById(user_settings.focus).focus()

    _input_search.value = user_settings.filters.search
    _input_replace.value = user_settings.filters.replace
    _input_note.value = user_settings.note;

    _select_lang_from.innerHTML = ''
    _select_lang_to.innerHTML = ''
    _select_regulator_from.innerHTML = ''
    _select_regulator_to.innerHTML = ''
    _ul_include.innerHTML = ''
    _ul_exclude.innerHTML = ''

    Array('All').concat(langs).forEach(lang => {
        const option_from = document.createElement('option')
        const option_to = document.createElement('option')
        option_from.textContent = lang
        option_to.textContent = lang
        if (lang === user_settings.lang.from) option_from.setAttribute('selected', true)
        if (lang === user_settings.lang.to) option_to.setAttribute('selected', true)
        _select_lang_from.appendChild(option_from)
        _select_lang_to.appendChild(option_to)
    })
    regulators.forEach(regulator => {
        const option_from = document.createElement('option')
        const option_to = document.createElement('option')
        option_from.textContent = regulator
        option_to.textContent = regulator
        if (regulator === user_settings.regulator.from) option_from.setAttribute('selected', true)
        if (regulator === user_settings.regulator.to) option_to.setAttribute('selected', true)
        _select_regulator_from.appendChild(option_from)
        _select_regulator_to.appendChild(option_to)
    })
    user_settings.filters.include.forEach(filter =>
        draw_filter(filter, user_settings.filters.include, _ul_include)
    )
    user_settings.filters.exclude.forEach(filter =>
        draw_filter(filter, user_settings.filters.exclude, _ul_exclude)
    )
    return user_settings
}
