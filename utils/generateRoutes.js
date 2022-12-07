const fs = require('fs')
,     config = require('../config')
,     path = require('path')

function readDirRecursive(p) {
  let files = fs.readdirSync(p, {
    //withFileTypes: true// works from node v10.13.0
  })
  return files.filter(f => !/^_/.test(f)).map(f => {
    let result = {
      name: f.replace(/\.ejs$/, '')
    }
    if (fs.lstatSync(p + '/' + f).isDirectory()) {
      result.children = readDirRecursive(path.join(p, f))
    }
    return result
  })
}

function generateLocale(custom = {}, files, data, prefix = '') {
  return files.reduce((localeData, file) => {
   if (file.children) {
     localeData = generateLocale(custom, file.children, localeData, file.name)
   } else {
     let key = prefix ? prefix + '-' + file.name : file.name
     ,    name = (key === 'index') ? '' : file.name

     name = prefix ? prefix + '/' + name : name

     if (custom && custom[name]) {
      localeData[key] = custom[name]
    }
     else
       localeData[key] = name
   }
   return localeData
 }, data)
}

module.exports = (customRoutes) => {
  let files = readDirRecursive('./views')
  return config.locales.reduce((result, locale) => {
    result[locale.code] = generateLocale(customRoutes[locale.code], files, {})
    return result
  }, {})
}
