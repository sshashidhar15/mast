var app = require('express').Router()
,   fetch = require('node-fetch')
,   createError = require('http-errors')
,   msgpack = require('msgpack-lite')
,   config = require('../../config')
,   {regulators, regulators_prefixes, branch_wcf_ids} = config
,   langs = config.locales.map(locale => locale.code)
,   words_count = require('../../utils/words_count')
,   layout = '_layouts/admin'
,   translation = require('../../models/translation')
,   page_by_key = require('../../models/page_by_key')
,   futures = require('../../models/futures')
const get_manager_login_by_token = require('../../models/get_manager_login_by_token')
const { getFileFromGithub } = require('../../models/github_lilt')

app.use((req, res, next) =>
    req.cookies.manager_token
        ?
            fetch(
                config.auth_service_url + '/manager/token_validate',
                {
                    method: 'POST',
                    body: msgpack.encode({token: req.cookies.manager_token})
                }
            )
                .then(_ => _.ok ? _.buffer() : Promise.reject(new Error(_.status)))
                .then(_ => msgpack.decode(_))
                .then(valid => {
                    if (valid === true) {
                        res.locals.isManager = valid
                        return get_manager_login_by_token(req.cookies.manager_token)
                            .then(login => res.locals.manager_login = login)
                            .then(() => next())
                    }
                    res.clearCookie('manager_token')
                    next(new createError.BadRequest())
                })
                .catch(() => {
                    res.clearCookie('manager_token')
                    next()
                })
        :
            next()
)


app.use((req, res, next) => {
  res.locals.layout = layout
  return req.url === '/auth' || res.locals.isManager
    ? next()
    : res.redirect('/admin/auth')

})

app.get('/pending', (req, res) =>
    res.render(
        '_admin/pending',
        {
            manager_login: res.locals.manager_login,
            langs,
            regulators_prefixes,
            regulators
        }
    )
)

app.post('/pending', (req, res) =>
    res.end(translation.get_pendings(req.regulator), 'binary')
)

app.post('/history', (req, res) =>
    res.end(translation.get_history(req.regulator, req.body.cache_length), 'binary')
)

app.post('/page_by_key', (req, res) =>
    res.end(page_by_key.get(), 'binary')
)

app.post('/revert', (req, res, next) =>
    translation.revert_approved_pending(
        req.regulator,
        req.body.locale,
        req.body.token,
        req.body.reason,
        req.cookies.manager_token
    )
    .then(() => res.status(200).end())
    .catch(next)
)

app.post('/getfilefromgithub', (req, res) => {
    getFileFromGithub(req.regulator, req.body.lang, req.body.branch).then(data => res.json(data))
})

app.post('/pending/import', (req, res) =>
    translation.create_translator(req.cookies.manager_token, 'Import translations from file (' + req.body.fn + ')')
        .then(token => translation.add_pendings(req.regulator, token, req.body.map_lang_translations))
        .then(() => res.json({ ok: true }))
        .catch(error => {
            res.json({ ok: false, error: error.message })
        })
)

app.get('/:path?', (req, res) =>
    req.params.path
    ? res.render(
        '_admin/' + (req.params.path || 'index'),
        {
            manager_login: res.locals.manager_login,
            langs,
            regulators,
            regulators_prefixes,
            branch_wcf_ids
        },
        (error, html) =>
            error
                ? res.status(500).render(
                    '_admin/error',
                    {
                        manager_login: res.locals.manager_login,
                        error,
                        regulators,
                        regulators_prefixes,
                        langs
                    }
                )
                : res.send(html)
    )
    : res.redirect('/admin/pending')
)

app.post('/auth', (req, res) => {
    var {login, password} = req.body;
    if (login === 'p.tanilian') return res.status(401).end()
    fetch(
        config.auth_service_url + '/manager/auth',
        {
            method: 'POST',
            body: msgpack.encode({login, password})
        }
    )
    .then(_ => _.ok ? _.buffer() : Promise.reject(new Error(_.status)))
    .then(_ => msgpack.decode(_).token)
    .then(token => {
        res.cookie('manager_token', token)
        res.end()
    })
    .catch(e => res.status(401).end(String(e)))
})

function getRedisBranch () {
    const redis = config.redis_host.split('-')
    return redis[0]
}

const site_environment = getRedisBranch()

app.post('/approve', (req, res, next) =>
    translation.approve_pending(req.regulator, req.body.locale, req.body.token, req.cookies.manager_token)
        .then(() => {
            if (req.body.note.toLowerCase().indexOf('import') < 0 && site_environment == 'prod' && !res.locals.isCnHost) {
                translation.push_approve_change_to_github(req.regulator, req.body.locale, req.body.note).then(e => {
                    res.json({msg: e, env: site_environment})
                }).catch(e => console.log('catch translation error', e))
            } else {
                res.json({ ok: true })
            }
        })
        .catch(next)
)

app.post('/dismiss', (req, res, next) =>
  translation.dismiss_pending(req.regulator, req.body.locale, req.body.token)
  .then(() => res.json({ ok: true }))
  .catch(next)
)


app.get('/words_count/:lang/:except?', (req, res) =>
    res.end(
        String(
            words_count(
                translation.get_current_by_lang(req.regulator, req.params.lang),
                0,
                key => key === req.params.except
            )
        )
    )
)

app.get('/CURRENT/:lang?', (req, res) =>
    res.json(
        req.params.lang
            ? translation.get_current_by_lang(req.regulator, req.params.lang)
            : translation.get_current(req.regulator)
    )
)

app.post('/create_translator', (req, res, next) => {
    var {note} = req.body;
    translation.create_translator(req.cookies.manager_token, note)
    .then(token => res.json({token}))
    .catch(next)
})

app.post('/futures/index', (req, res, next) =>
    futures.admin_change_index(req.regulator, req.body.json)
        .then(() => res.status(200).end('ok'))
        .catch(next)
)
app.post('/futures/commodity', (req, res, next) =>
    futures.admin_change_commodity(req.regulator, req.body.json)
        .then(() => res.status(200).end('ok'))
        .catch(next)
)
app.post('/futures/bonds', (req, res, next) =>
    futures.admin_change_bonds(req.regulator, req.body.json)
        .then(() => res.status(200).end('ok'))
        .catch(next)
)

app.post('/futures/index_all', (req, res, next) =>
    futures.admin_change_index_all(req.body.json)
        .then(() => res.status(200).end('ok'))
        .catch(next)
)
app.post('/futures/commodity_all', (req, res, next) =>
    futures.admin_change_commodity_all(req.body.json)
        .then(() => res.status(200).end('ok'))
        .catch(next)
)
app.post('/futures/bonds_all', (req, res, next) =>
    futures.admin_change_bonds_all(req.body.json)
        .then(() => res.status(200).end('ok'))
        .catch(next)
)
app.get('/futures/download_index_history', (req, res, next) =>
    futures.admin_ask_index_history(req.regulator)
        .then(_ => res.status(200).json(_))
        .catch(next)
)
app.get('/futures/download_commodity_history', (req, res, next) =>
    futures.admin_ask_commodity_history(req.regulator)
        .then(_ => res.status(200).json(_))
        .catch(next)
)
app.get('/futures/download_bonds_history', (req, res, next) =>
    futures.admin_ask_bonds_history(req.regulator)
        .then(_ => res.status(200).json(_))
        .catch(next)
)
app.post('/replace', (req, res) =>
    translation.create_translator(req.cookies.manager_token, 'Admin global replace "' + req.body.replace.from + ' -> ' + req.body.replace.to + '" ' + req.body.note)
        .then(token =>
            translation.add_pendings(req.regulator, token, req.body.map_lang_translations)
        )
        .then(() => res.json({ok: true}))
        .catch(error => {
            res.json({ok: false, error: error.message})
        })
)
app.post('/move', (req, res, next) => {
    translation.create_translator(req.cookies.manager_token, 'Admin move ' + req.body.regulator.from + '/' + req.body.lang.from + ' -> ' + req.body.regulator.to + '/' + req.body.lang.to + ' ' + req.body.note)
    .then(token =>
        translation.add_pendings(req.body.regulator.to, token, req.body.changes)
    )
    .then(() => res.json({ ok: true }))
    .catch(next)
})

app.post('/get_users', (req, res, next) =>
    fetch(
        config.auth_service_url + '/manager/get_users',
        {
            method: 'POST',
            headers: {
                'Accept': 'application/x-msgpack',
                'Content-Type': 'application/x-msgpack'
            },
            body: msgpack.encode({token: req.cookies.manager_token})
        }
    )
        .then(_ => _.ok ? _.buffer() : Promise.reject(new Error('get_users fail')))
        .then(_ => msgpack.decode(_).users)
        .then(users => res.json({users}))
        .catch(next)
)

module.exports = app
