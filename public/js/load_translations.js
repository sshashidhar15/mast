/*global msgpack*/
window.load_translations = function (regulators, langs, onprogress) {
    const translations = {}

    return Promise.all(
        regulators.reduce(
            (flat, regulator) =>
                flat.concat(langs.map(lang =>
                    fetch(
                        ['', 'CURRENT', regulator, lang].join('/')
                    )
                        .then(_ => _.arrayBuffer())
                        .then(_ => msgpack.decode(new Uint8Array(_)))
                        .then(_ => {
                            onprogress(regulator, lang, _)
                            translations[regulator] = translations[regulator] || {}
                            translations[regulator][lang] = _
                        })
                )),
            []
        )
    ).then(() => translations)
}
