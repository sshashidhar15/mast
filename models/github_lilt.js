const simpleGit = require('simple-git')
const fetch = require('node-fetch')
const config = require('../config')
const TOKEN = config.IMPORT_REDIS_JSON_FROM_GITHUB_TOKEN
let msg = {}
let branch = ''

async function gitInit () {
    const git = simpleGit('./githubJSON').outputHandler((cmd, stdOut, stdErr) => {
        let out = []
        msg.cmd = cmd
        msg.stdOut = stdOut
        stdErr.on('data', buffer => out.push(buffer.toString('utf8')))
        stdErr.on('close', () => msg.giterror = out)
      })
    // const remotes = await git.getRemotes()
    // if (remotes[0] && remotes[0].name == 'origin-lilt') return
    // branch = getRedisBranch()
    branch = 'master'
    // branch = 'development'
    try {
        await git.init()
        await git.addConfig('user.name', 'ICM-Dev', false, simpleGit.GitConfigScope.global)
        await git.addConfig('user.email', 'dev_test@icmarkets.com.au', false, simpleGit.GitConfigScope.global)
        await git.addRemote('origin-lilt', `https://${TOKEN}@github.com/ICMarkets/WWW2.Contents.git`)
        return git
    } catch (e) {
        console.log('simple git init error', e)
        return msg.giterror
    }
}

async function getFileFromGithub (regulator, lang, import_branch) {
    const URL = `https://api.github.com/repos/ICMarkets/WWW2.Contents/contents/${regulator}/${regulator}-${lang}.json?ref=${import_branch}`
    let data
    try {
        data = await fetch(
            URL,
            {
                method: 'GET',
                headers: {
                    'authorization': `token ${TOKEN}`,
                    "Accept": "application/vnd.github.raw+json"
                }
            }
        )
        return await data.json()
    } catch (e) {
        console.log('data from github error', e)
        msg.getFileFromGithubError = e
    }
}

async function write_to_github (git, regulator, lang) {
    try {
        await git.add(`./${regulator}/${regulator}-${lang}.json`)
        await git.commit(`Update ${regulator}-${lang}.json`)
        await git.push('origin-lilt', branch)
        // console.log('push to github')
    } catch (e) {
        console.log('simple git error', e)
        return e
        // msg.writeToGithubError = e
    }
}

// async function write_to_github (git) {
//     try {
//         await git.add(`./asic/testval.txt`)
//         await git.commit(`test value`)
//         await git.push('origin-lilt', branch)
//         // console.log('push to github')
//     } catch (e) {
//         console.log('simple git error', e)
//         return e
//         // msg.writeToGithubError = e
//     }
// }

async function write_to_github_all_files (git) {
    try {
        await git.add(`./*`)
        await git.commit(`Update all files due to new key added`)
        await git.push('origin-lilt', branch)
    } catch (e) {
        console.log('write to github error', e)
        return e
        // msg.writeToGithubError = e
    }
}

async function sync_githubjson_with_remote_repo (git) {
    try {
        await git.pull('origin-lilt', branch)
        if (branch !== 'master') {
            await git.checkout(['-b', branch, 'master'])
        }
    } catch (e) {
        console.log('Sync with github error', e)
        return e
        // msg.syncWithGithubError = e
    }
}

module.exports.gitInit = gitInit
module.exports.getFileFromGithub = getFileFromGithub
module.exports.write_to_github = write_to_github
module.exports.sync_githubjson_with_remote_repo = sync_githubjson_with_remote_repo
module.exports.githubLiltmsg = msg
module.exports.write_to_github_all_files = write_to_github_all_files
