const Career = require('../models/career')
,     getLocaleData = require('../utils/getLocaleData')
,     I18n = require('i18n-2')
,     T = require('../utils/translator')

module.exports.up = function (next) {
  getLocaleData()
  .then(locales => {
    let i18n = new I18n({
      cookieName: 'user_want_language',
      locales: locales[0],
      parse: null,
      dump: null
    })
    ,   t = new T(i18n)

    i18n.setLocale('en')
    t.setI18nPrefix('pages.company.careers')

    var vacanciesAu = Array(7).fill('').map((e, i) => ({
      title: t.$t(`careers_vacancy_au_${i}_title`),
      content: t.$t(`careers_vacancy_au_${i}_content`),
    }))
    var vacanciesCy = Array(7).fill('').map((e, i) => ({
      title: t.$t(`careers_vacancy_cy_${i}_title`),
      content: t.$t(`careers_vacancy_cy_${i}_content`),
    }))

    let p = new Promise(y => y())
    ,   td
    while (td = vacanciesAu.shift()) {
      td.au = true
      p = p.then(((t) => Career.create(t)).bind(null, td))
    }
    while (td = vacanciesCy.shift()) {
      td.cy = true
      p = p.then(((t) => Career.create(t)).bind(null, td))
    }


    p.then(() => Career.getAll())
    .then(() => next())
    .catch(next)
  })
}

module.exports.down = function (next) {
  next()
}
