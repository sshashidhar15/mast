const fs = require('fs')
const config = require('../config')
var lang = {}
lang['en'] = require('../locales/en');
lang['ar'] = require('../locales/ar');
lang['cn'] = require('../locales/cn');
lang['cz'] = require('../locales/cz');
lang['de'] = require('../locales/de');
lang['es'] = require('../locales/es');
lang['it'] = require('../locales/it');
lang['my'] = require('../locales/my');
lang['pt'] = require('../locales/pt');
lang['ru'] = require('../locales/ru');
lang['th'] = require('../locales/th');
lang['vn'] = require('../locales/vn');

// SEE utils/translator.js:24
let keys = fs.readFileSync('../keys.txt').toString().split('\n')
keys = keys.filter((k, i) => keys.indexOf(k) === i)

function extractKeys(obj, prefix = '') {
  let result = [];
  Object.keys(obj).forEach((el) => {
    let fullKey = [prefix, el].filter(e => !!e).join('.')

    if (typeof obj[el] === 'string') {
      result.push(fullKey)
    } else {
      result = result.concat(extractKeys(obj[el], fullKey))
    }
  });

  return result
}

config.locales.forEach(l => {
  let toDelete = extractKeys(lang[l.code]).filter(key => !~keys.indexOf(key))
  console.log(l.code, toDelete.length)
  console.log(toDelete.slice(0, 40))
})
