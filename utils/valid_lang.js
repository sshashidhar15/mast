var langs = require('../config').locales.map(locale => locale.code);

module.exports = lang => langs.indexOf(lang) !== -1
