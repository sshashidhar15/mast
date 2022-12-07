const redis_pub = require('../redis_pub')
const channels = require('./channels')
const msgpack = require('msgpack-lite')
const fetch = require('node-fetch')
const config = require('../config')
const regulators = process.env.IS_CN_HOST === 'true' ? config.regulators_cn : config.regulators
const redis = require('../redis')
const updateTranslation = require('../utils/update_translation')
const langs = config.locales.map(_ => _.code)
const validate_translations_suggestion = require('../utils/validate_translations_suggestion')
const getLocaleData = require('../utils/getLocaleData')
const add_del_langs_by_config_locales = require('../utils/add_del_langs_by_config_locales')(langs)
const { deleteFolderRecursive } = require('../utils/fs_module_functions')
const get_manager_login_by_token = require('./get_manager_login_by_token')
const fs = require('fs')
const { gitInit, write_to_github, sync_githubjson_with_remote_repo, githubLiltmsg, write_to_github_all_files } = require('./github_lilt')
// "state" is in memory cache for fast get actual data.
// Access to "state" disign by getter/setter functions like: get_something_by_regulator(regulator)
const state = {
    translations: regulators.reduce((_, r) => {_[r] = {};return _}, {}),
    translations_binary: regulators.reduce((_, r) => {_[r] = {};return _}, {}),
    pendings: regulators.reduce((_, r) => {_[r] = langs.reduce((_, l) => {_[l] = {};return _}, {});return _}, {}),
    history: regulators.reduce((_, r) => {_[r] = [];return _}, {})
}

function token2note (token) {
    return fetch(
        config.auth_service_url + '/translator/note',
        {
            method: 'POST',
            body: msgpack.encode({token})
        }
    )
        .then(_ => _.ok ? _.buffer() : Promise.reject(new Error(_.status)))
        .then(_ => msgpack.decode(_).note)
}

// Version of token2note with cache for avoid extra requests to auth-service
//
//function token2note (token) {
//    var pending
//    for (var i = 0;!pending && i < regulators.length;i++)
//        pending = state.pendings[regulators[i]].find(_ => _.token === token) || state.history[regulators[i]].find(_ => _.token === token)
//
//    return pending
//        ? Promise.resolve(pending.note)
//        : fetch(
//            config.auth_service_url + '/translator/note',
//            {
//                method: 'POST',
//                body: msgpack.encode({token})
//            }
//        )
//            .then(_ => _.ok ? _.buffer() : Promise.reject(new Error(_.status)))
//            .then(_ => msgpack.decode(_).note)
//}

function create_translator (manager, note) {
  return fetch(
      config.auth_service_url + '/translator/registration_token',
      {
          method: 'POST',
          body: msgpack.encode({
              note,
              token: manager
          })
      }
  )
  .then(_ => _.buffer())
  .then(_ => msgpack.decode(_).token)
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

function load_pendings (regulator) {
    return redis_promise()
        .then(db =>
            Promise.all(langs.map(lang =>
                new Promise((y, n) =>
                    db.hgetall(redis.PENDINGS[regulator][lang], (e, pendings) =>
                        e
                            ? n(e)
                            : y(pendings)
                    )
                )
            ))
        )
        .then(_ =>
            langs.reduce(
                (pendings, lang, i) => {
                    pendings[lang] = _[i] || {}
                    return pendings
                },
                {}
            )
        )
}

function load_history (regulator) {
    return redis_promise()
        .then(db =>
            Promise.all([
                new Promise((y, n) =>
                    db.hgetall(redis.SUGGESTION[regulator], (e, legacy_mix) =>
                        e
                            ? n(e)
                            : y(legacy_mix))),
                new Promise((y, n) =>
                    db.lrange(redis.HISTORY[regulator], 0, -1, (e, history) =>
                        e
                            ? n(e)
                            : y(history)))
            ])
        )
        .then(([legacy_mix, current]) => {
            const legacy_history = Object.keys(legacy_mix || {})
                .reduce((a, _) => a.concat(legacy_mix[_]), [])
                .filter(_ => msgpack.decode(_).approved === true)
                .sort((a, b) => msgpack.decode(b).approve_time - msgpack.decode(a).approve_time)

            return current.concat(legacy_history)
        })
}

function on_pending_set (regulator, pending) {
    const _ = msgpack.decode(pending)
    state.pendings[regulator][_.locale][_.token] = pending
}

function on_pending_del (regulator, message) {
    const _ = msgpack.decode(message)
    delete state.pendings[regulator][_.locale][_.token]
}

function on_history (regulator, pending) {
    state.history[regulator].unshift(pending)
}

function getRedisBranch () {
    const redis = config.redis_host.split('-')
    return redis[0]
}

const site_environment = getRedisBranch()

function load_in_memory_state_for_all_regulators() {
    return Promise.all([
        Promise.all(
            regulators.map((regulator, index) =>
                getLocaleData(regulator)
                    .then(add_del_langs_by_config_locales(regulator))
                    .then(_ => {
                        if (_[1] && index == 0 && site_environment == 'prod') {
                            push_all_files_to_github().then(() => {
                                // console.log('test translation error', e)
                            }).catch(e => console.log('catch translation error', e))
                        }
                        state.translations[regulator] = _[0]
                        Object.keys(_[0]).forEach(lang =>
                            state.translations_binary[regulator][lang] = msgpack.encode(_[0][lang])
                        )
                    })
            )
        ),
        Promise.all(regulators.map(regulator =>
            load_pendings(regulator)
                .then(pendings =>
                    state.pendings[regulator] = pendings
                )
        )),
        Promise.all(regulators.map(regulator =>
            load_history(regulator)
                .then(history =>
                    state.history[regulator] = history
                )
        ))
    ])
}

function add_pendings (regulator, token, changes) {
    const changes_locales = Object.keys(changes)
    let error_message = null
    const error_lang = changes_locales.find(locale => {
        error_message = validate_translations_suggestion(changes[locale], state.translations[regulator][locale])
        return error_message
    })

    if (error_lang) return Promise.reject(new Error('Add pending failed: invalid translations for lang "' + error_lang + '", ' + error_message))

    return Promise.all([
        redis_promise(),
        token2note(token)
    ])
        .then(([db, note]) =>
            Promise.all(changes_locales.map(locale =>
                new Promise((y, n) => {
                    var pending
                    if (state.pendings[regulator][locale][token]) {
                        pending = msgpack.decode(state.pendings[regulator][locale][token])
                        pending.translations = changes[locale]
                        pending.update_times = pending.update_times || []
                        pending.update_times.push(Date.now())
                    } else {
                        pending = Object({
                            locale,
                            token,
                            note,
                            translations: changes[locale],
                            update_times: [Date.now()]
                        })
                    }
                    pending = msgpack.encode(pending)
                    db.hset(redis.PENDINGS[regulator][locale], token, pending, e =>
                        e
                            ? n(e)
                            : redis_pub((e, pub) =>
                                e
                                    ? n(e)
                                    : channels.get_pending_set_channel(regulator).then(channel =>
                                        pub.publish(
                                            channel,
                                            pending,
                                            () => y()
                                        )
                                    )
                            )
                    )
                })
            ))
        )
}

function get_pendings (regulator) {
    return msgpack.encode(state.pendings[regulator])
}

function get_translations_for_token_by_lang_from_not_approved_pendings (regulator, token) {
    return langs.reduce(
        (_, lang) => {
            if (state.pendings[regulator][lang][token])
                _[lang] = msgpack.decode(state.pendings[regulator][lang][token]).translations
            return _
        },
        {}
    )
}

function approve_pending (regulator, locale, token, approve_manager_token) {
    if (!state.pendings[regulator][locale][token]) return Promise.reject(new Error(['No such pending for approve ', regulator, locale, token]))

    return Promise.all([
        redis_promise(),
        get_manager_login_by_token(approve_manager_token)
    ])
        .then(([db, approve_manager_login]) => {
            const pending = msgpack.decode(state.pendings[regulator][locale][token])
            if (state.translations[regulator][locale]['careers'] === undefined) state.translations[regulator][locale]['careers'] = {}//new branch created from etalon(*.json) do not have careers
            const pending_approved = msgpack.encode({
                ...pending,
                before: Object.keys(pending.translations).reduce(
                    (before, path) => {
                        const careers = path.startsWith('careers.')
                        const keys = path.split('.')
                        before[path] = keys.reduce(
                            (node, key, i) => {
                                if (node[key] === undefined && careers)
                                    i == keys.length - 1
                                        ? (node[key] = '')
                                        : node[key] = {}
                                return node[key]
                            },
                            state.translations[regulator][locale]
                        )
                        return before
                    },
                    {}
                ),
                approve_manager_token,
                approve_manager_login,
                approve_time: Date.now(),
                approved: true
            })

            return updateTranslation(regulator, pending.locale, pending.translations)
                .then(() =>
                    Promise.all([
                        new Promise((y, n) =>
                            db.hdel(redis.PENDINGS[regulator][locale], token, e =>
                                e
                                    ? n(e)
                                    : redis_pub((e, pub) =>
                                        e
                                            ? n(e)
                                            : channels.get_pending_del_channel(regulator).then(channel =>
                                                pub.publish(
                                                    channel,
                                                    msgpack.encode({locale, token}),
                                                    () => y()
                                                )
                                            )
                                    )
                            )
                        ),
                        new Promise((y, n) =>
                            db.lpush(redis.HISTORY[regulator], pending_approved, e =>
                                e
                                    ? n(e)
                                    : redis_pub((e, pub) =>
                                        e
                                            ? n(e)
                                            : channels.get_history_channel(regulator).then(channel =>
                                                pub.publish(
                                                    channel,
                                                    pending_approved,
                                                    () => y()
                                                )
                                            )
                                    )
                            )
                        )
                    ])
                )
        })
}

function push_all_files_to_github () {
    let msg = {}
    return new Promise(async (y,n) => {
            try {
                const dir = './githubJSON'

                if (fs.existsSync(dir)) {
                    deleteFolderRecursive(dir)
                }

                await fs.promises.mkdir(dir, { recursive: true })
                msg.aftermkdir = 'done'

                const git = await gitInit()

                msg.syncWithGithubError = await sync_githubjson_with_remote_repo(git)

                Promise.all(regulators.map(regulator =>
                    Promise.all(langs.map(async (lang) => {
                        var file = []
                        const localeDate = await getLocaleData(regulator, lang)
                        file.push(localeDate)
                        return fs.promises.writeFile(`./githubJSON/${regulator}/${regulator}-${lang}.json`, JSON.stringify(file, null, '\t')).then(() => {
                            msg.afterfilepush = 'done'
                            return msg
                        })
                    }))
                ))
                .then(() => {
                    write_to_github_all_files(git).then((data) => {
                        msg.writeToGithubError = data
                        msg.githubLiltmsg = githubLiltmsg
                        y(msg)
                    }).catch(e => {
                        msg.githubLiltmsg = githubLiltmsg
                        console.log('push to github error', e)})
                })
                .catch(e => console.log('write to file error', e))
            } catch (err) {
                msg.err = err
                console.log('fs error',msg)
                n(msg)
            }
    })
}

function push_approve_change_to_github (regulator, lang) {
    let msg = {}

    return getLocaleData(regulator, lang)
        .then(async (_) => {
                try {
                    const dir = './githubJSON'
                    if (fs.existsSync(dir)) {
                        msg.beforerm = 'done'
                        // fs.rmSync(dir, { recursive: true, force: true })
                        deleteFolderRecursive(dir)
                        msg.rmSync = 'done'
                    }
                    await fs.promises.mkdir(`${dir}/${regulator}`, { recursive: true })
                    msg.aftermkdir = 'done'

                    const git = await gitInit()

                    msg.syncWithGithubError = await sync_githubjson_with_remote_repo(git)

                    // var file_locale = {}
                    var file = []
                    // file_locale[lang] = _
                    file.push(_)
                    msg.afterfilepush = 'done'
                    await fs.promises.writeFile(`./githubJSON/${regulator}/${regulator}-${lang}.json`, JSON.stringify(file, null, '\t'))
                    console.log('write to file done!!!')
                    msg.writeToGithubError = await write_to_github(git, regulator, lang)
                    // console.log('write to github error translation', msg.writeToGithubError)
                    msg.githubLiltmsg = githubLiltmsg
                    return msg
                } catch (err) {
                    msg.err = err
                    console.log('fs error',msg)
                    return msg
                }
        })
}

function revert_approved_pending (regulator, locale, token, reason, manager_token) {
    const pending = state.history[regulator]
        .map(_ => msgpack.decode(_))
        .find(_ => _.locale === locale && _.token === token)

    if (!pending) return Promise.reject(new Error(['No pending in history for', 'regulator:', regulator, 'locale:', locale, 'token:', token].join(' ')))

    return Promise.all([
        get_manager_login_by_token(manager_token),
        token2note(token)
    ])
        .then(([manager_login, base_note]) =>
            create_translator(manager_token, 'Revert by ' + manager_login + ': ' + base_note + ' (Reason: ' + reason + ')')
        )
        .then(new_translator_for_revert_token => {
            const changes = {}
            changes[locale] = pending.before
            return add_pendings(
                regulator,
                new_translator_for_revert_token,
                changes
            )
        })
}

function dismiss_pending (regulator, locale, token) {
    return redis_promise()
        .then(db =>
            new Promise((y, n) =>
                db.hdel(redis.PENDINGS[regulator][locale], token, e =>
                    e
                        ? n(e)
                        : redis_pub((e, pub) =>
                            e
                                ? n(e)
                                : channels.get_pending_del_channel(regulator).then(channel =>
                                    pub.publish(
                                        channel,
                                        msgpack.encode({locale, token}),
                                        () => y()
                                    )
                                )
                        )
                )
            )
        )
}

function get_current_by_lang (regulator, lang) {
    return state.translations[regulator][lang]
}

function get_current_by_lang_binary (regulator, lang) {
    return state.translations_binary[regulator][lang]
}

function set_current_by_lang (regulator, lang, _) {
    state.translations[regulator][lang] = _
    state.translations_binary[regulator][lang] = msgpack.encode(_)
  }

function get_current (regulator) {
    return state.translations[regulator]
}

function get_history (regulator, cache_length) {
    const total_length = state.history[regulator].length
    const latest = []
    for (var i = 0;i < total_length - cache_length;i++) latest[i] = state.history[regulator][i]
    return msgpack.encode(latest)
}


module.exports.token2note = token2note
module.exports.create_translator = create_translator
module.exports.on_pending_set = on_pending_set
module.exports.on_pending_del = on_pending_del
module.exports.on_history = on_history
module.exports.load_in_memory_state_for_all_regulators = load_in_memory_state_for_all_regulators
module.exports.add_pendings = add_pendings
module.exports.get_pendings = get_pendings
module.exports.get_history = get_history
module.exports.get_translations_for_token_by_lang_from_not_approved_pendings = get_translations_for_token_by_lang_from_not_approved_pendings
module.exports.approve_pending = approve_pending
module.exports.revert_approved_pending = revert_approved_pending
module.exports.dismiss_pending = dismiss_pending
module.exports.get_current_by_lang = get_current_by_lang
module.exports.get_current_by_lang_binary = get_current_by_lang_binary
module.exports.set_current_by_lang = set_current_by_lang
module.exports.get_current = get_current
module.exports.get_history = get_history
module.exports.push_approve_change_to_github = push_approve_change_to_github
module.exports.push_all_files_to_github = push_all_files_to_github
