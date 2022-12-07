/* global
regulators
langs
load_translations
_button_export
_loading_translations_regulator
_loading_translations_lang
_select_regulator
_select_lang
_link_container
_input_import_json
_un_loading_translations_lang
_un_loading_translations_regulator
_un_select_lang
_un_select_regulator
never_used_keys
already_used_keys
never_used_keys_count
already_used_keys_count
_un_button_export
_un_link_container
_never_used_container
_already_used_container
_lang_import_select
_show_regulator
_import_json
regulator_selector
*/

const links = {}
const untranslated = {}
const un_links = {}
let never_used_link = null
let already_used_link = null

function onupdate_during_loading_translations (regulator, lang) {
    _loading_translations_regulator.textContent = regulator
    _loading_translations_lang.textContent = lang

    _un_loading_translations_regulator.textContent = regulator
    _un_loading_translations_lang.textContent = lang
}

function time_format () {
    const date = new Date()
    return [
        date.getFullYear(),
        date.getMonth() + 1,
        date.getDate(),
        date.getHours(),
        date.getMinutes()
    ]
        .map(_ => _ < 10 ? '0' + _ : _)
        .join('-')
}

['all'].concat(langs).forEach(lang => {
    const option = document.createElement('option')
    option.textContent = lang
    _select_lang.appendChild(option)

    const un_option = document.createElement('option')
    un_option.textContent = lang
    _un_select_lang.appendChild(un_option)
})

regulators.forEach(regulator => {
    const option = document.createElement('option')
    option.textContent = regulator
    _select_regulator.appendChild(option)

    const un_option = document.createElement('option')
    un_option.textContent = regulator
    _un_select_regulator.appendChild(un_option)
})

load_translations(regulators, langs, onupdate_during_loading_translations)
    .then(_ => {
        Object.keys(_).forEach(regulator => {
            // ALL
            links[regulator] = Object.keys(_[regulator]).reduce(
                (a, lang) => {
                    const filename = ['icmarkets', 'translations', regulator, lang, time_format()].join('-') + '.json'
                    a[lang] = document.createElement('a')
                    a[lang].setAttribute('target', '_blank')
                    a[lang].setAttribute('download', filename)
                    const json = {}
                    json[lang] = _[regulator][lang]
                    a[lang].href = URL.createObjectURL(
                        new Blob(
                            [JSON.stringify([json], null, 4)],
                            {type: 'application/json'}
                        )
                    )
                    a[lang].textContent = filename
                    return a
                },
                {}
            )
            const filename = ['icmarkets', 'translations', regulator, 'all', time_format()].join('-') + '.json'
            links[regulator]['all'] = document.createElement('a')
            links[regulator]['all'].setAttribute('target', '_blank')
            links[regulator]['all'].setAttribute('download', filename)
            links[regulator]['all'].href = URL.createObjectURL(
                new Blob(
                    [JSON.stringify([_[regulator]], null, 4)],
                    {type: 'application/json'}
                )
            )
            links[regulator]['all'].textContent = filename

            // UNTRANSLATED
            untranslated[regulator] = {}
            let en = _[regulator]['en']
            un_links[regulator] = Object.keys(_[regulator]).reduce(
                (a, lang) => {
                    let un = find_untranslated_keys(en, _[regulator][lang])
                    untranslated[regulator][lang] = toTree(un)
                    const json = {}
                    json[lang] = untranslated[regulator][lang]
                    const count = Object.keys(json[lang]).length
                    const un_filename = ['icmarkets', 'untranslated', regulator, count, lang, time_format()].join('-') + '.json'
                    a[lang] = document.createElement('a')
                    a[lang].setAttribute('target', '_blank')
                    a[lang].setAttribute('download', un_filename)
                    a[lang].href = URL.createObjectURL(
                        new Blob(
                            [JSON.stringify([json], null, 4)],
                            {type: 'application/json'}
                        )
                    )
                    a[lang].textContent = un_filename
                    return a
                },
                {}
            )
            const un_filename = ['icmarkets', 'untranslated', regulator, 'all', time_format()].join('-') + '.json'
            un_links[regulator]['all'] = document.createElement('a')
            un_links[regulator]['all'].setAttribute('target', '_blank')
            un_links[regulator]['all'].setAttribute('download', un_filename)
            un_links[regulator]['all'].href = URL.createObjectURL(
                new Blob(
                    [JSON.stringify([untranslated[regulator]], null, 4)],
                    {type: 'application/json'}
                )
            )
            un_links[regulator]['all'].textContent = un_filename
        })

        // NEVER USED
        const never_used_filename = ['icmarkets', 'never', 'used', never_used_keys_count, 'keys', time_format()].join('-') + '.json'
        never_used_link = document.createElement('a')
        never_used_link.setAttribute('target', '_blank')
        never_used_link.setAttribute('download', never_used_filename)
        never_used_link.href = URL.createObjectURL(
            new Blob(
                [never_used_keys],
                {type: 'application/json'}
            )
        )
        never_used_link.textContent = never_used_filename

        // ALREADY USED
        const already_used_filename = ['icmarkets', 'already', 'used', already_used_keys_count, 'keys', time_format()].join('-') + '.json'
        already_used_link = document.createElement('a')
        already_used_link.setAttribute('target', '_blank')
        already_used_link.setAttribute('download', already_used_filename)
        already_used_link.href = URL.createObjectURL(
            new Blob(
                [already_used_keys],
                {type: 'application/json'}
            )
        )
        already_used_link.textContent = already_used_filename

        _select_regulator.removeAttribute('disabled')
        _select_lang.removeAttribute('disabled')
        _button_export.innerHTML = 'Translations are loaded'

        _un_select_regulator.removeAttribute('disabled')
        _un_select_lang.removeAttribute('disabled')
        _un_button_export.innerHTML = 'Translations are loaded'

        onchange()
    })


function onchange () {
    _link_container.innerHTML = ''
    if (_select_regulator.value && _select_lang.value) _link_container.appendChild(links[_select_regulator.value][_select_lang.value])

    _un_link_container.innerHTML = ''
    if (_un_select_regulator.value && _un_select_lang.value) _un_link_container.appendChild(un_links[_un_select_regulator.value][_un_select_lang.value])

    _never_used_container.innerHTML = ''
    _never_used_container.appendChild(never_used_link)

    _already_used_container.innerHTML = ''
    _already_used_container.appendChild(already_used_link)
}

_select_lang.onchange           = onchange
_select_regulator.onchange      = onchange

_un_select_lang.onchange        = onchange
_un_select_regulator.onchange   = onchange

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

    langs.forEach(lang => {
        const option = document.createElement('option')
        option.textContent = lang
        option.value = lang
        _lang_import_select.appendChild(option)
    })

    function showRegulatorOnImportPage () {
        _show_regulator.innerHTML = getRegulator()
    }

    function getRegulator () {
        return regulator_selector.options[regulator_selector.selectedIndex].text
    }

    showRegulatorOnImportPage()

    regulator_selector.addEventListener('change', showRegulatorOnImportPage)

    async function getFileFromGithub(lang, branch) {
        let data

        try {
            data = await fetch(
                location.href.replace('import_export', 'getfilefromgithub'),
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        lang,
                        branch
                    })
                }
            )
            const content = await data.json()
            return {content, lang}
        } catch (e) {
            alert(`Import from Github failed: ${e.message}`)
            console.log('data from github error', e)
        }
    }

    let import_file_lang = ''

    function enableImportBtn () {
        if (import_file_lang) {
            _import_json.classList.remove('disabled')
        }
    }

    _lang_import_select.addEventListener('change', () => {
        import_file_lang = _lang_import_select.value
        enableImportBtn()
    })

    function importFile (tree) {
        const map_lang_translations = Object.keys(tree).reduce(
            (m, locale) => {
                m[locale] = toFlat(tree[locale])
                return m
            },
            {}
        )
        return fetch(
            location.href.replace('import_export', 'pending/import'),
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    fn: `${import_file_lang}.json`,
                    map_lang_translations
                })
            }
        )
            .then(_ => _.json())
            .then(_ =>
                _.ok
                    ? Promise.resolve()
                    : Promise.reject(new Error(_.error))
            )
    }

    _import_json.addEventListener(
        'click',
        () => {
            if (import_file_lang) {
                _import_json.disabled = true
                const b = document.createElement('b')
                b.innerHTML = '🔃'
                _import_json.appendChild(b)
                if (import_file_lang === 'all') {
                    Promise.all(
                        langs.map(lang => {
                            return getFileFromGithub(lang, 'master')
                        })
                    )
                        .then(files => {
                            Promise.all(
                                files.map(file => {
                                    let locale_file = {}
                                    locale_file[file.lang] = file.content[0]
                                    return importFile(locale_file)
                                })
                            )
                                .then(() => {
                                    _import_json.innerHTML = 'Import'
                                    _import_json.removeAttribute('disabled')
                                    alert('import done')
                                    }
                                )
                                .catch(e => alert('import failed: ' + e.message))
                        })
                } else {
                    getFileFromGithub(import_file_lang, 'master').then(file => {
                        let locale_file = {}
                        locale_file[file.lang] = file.content[0]
                        importFile(locale_file).then(() => {
                            _import_json.innerHTML = 'Import'
                            _import_json.removeAttribute('disabled')
                            alert('import done')
                            }
                        )
                        .catch(e => alert('import failed: ' + e.message))
                    })
                }
            }
        }
    )

_input_import_json.addEventListener(
    'change',
    function onchange () {
        const files = []
        for (var i = 0;i < this.files.length;i++) files[i] = this.files[i]
        Promise.all(
            files.map(file =>
                file.text().then(json => {
                    const tree = JSON.parse(json)[0]
                    const map_lang_translations = Object.keys(tree).reduce(
                        (m, locale) => {
                            m[locale] = toFlat(tree[locale])
                            return m
                        },
                        {}
                    )
                    return fetch(
                        location.href.replace('import_export', 'pending/import'),
                        {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                                fn: file.name,
                                map_lang_translations
                            })
                        }
                    )
                        .then(_ => _.json())
                        .then(_ =>
                            _.ok
                                ? Promise.resolve()
                                : Promise.reject(new Error(_.error))
                        )
                })
            )
        )
            .then(() => alert('import done'))
            .catch(e => alert('import failed: ' + e.message))

    },
    false
)

var find_untranslated_keys = (a, b, path = [], paths = []) => {
    if (typeof a === 'string') {
        if (a === b) {
            path.push(a)
            paths.push(path)
        }
        return paths
    }

    return Object.keys(a || {}).reduce(
        (paths, key) =>
            find_untranslated_keys(a[key], b[key], path.concat(key), paths),
        paths
    )
}

var toTree = (arr) => {
    let tree = {}
    arr.forEach(a => {
        let v = a.pop()
        let d = tree
        for (let i = 0;i < a.length;i++) {
            let _ = a[i]
            if (!d[_]) {
                d[_] = {}
            }
            if (i === a.length - 1) {
                d[_] = v
            } else {
                d = d[_]
            }
        }
    })
    return tree
}
