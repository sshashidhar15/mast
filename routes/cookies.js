/* eslint-disable */
var hostname2domain = require('../utils/hostname2domain');
const valid_regulator = require('../utils/valid_regulator');
const days = 24 * 60 * 60 * 1000
const maxAge_1_day = 1 * days
const maxAge_30_days = 30 * days

module.exports = (req, res, next) => {
  let { query, cookies } = req
  query = Object.keys(query).reduce((acc, key) => {
    acc[key.toLowerCase()] = query[key]
    return acc
  }, {})

  var domain = hostname2domain(req.hostname);

  if (query.set_lang) {
    res.cookie('user_want_language', query.set_lang)
  }

  // get CAMP cookie
  // var cookieCamp = cookies.camp;
  // get CAMP from query
  var camp = query.camp;

  // https://icmarkets.com/au/en/?camp=222&camp=33 return camp = [222, 33]
  // user can have only one camp id
  // we use first camp in this case
  if (typeof camp === 'object' && camp.length > 1) camp = camp[0]

  if (camp && camp != '') {
    // set CAMP cookie
    if (typeof camp === 'string') {
        camp = camp.replace(/\D/g, ''); // strip non-digits
        res.cookie('camp', camp, { maxAge: maxAge_30_days, domain });
        res.cookie('camp_click', camp, { maxAge: maxAge_30_days, domain });
    } else {
        console.error('typeof camp is not string. query: ' + JSON.stringify(query) + '. cookies: ' + JSON.stringify(cookies) + '. url: ' + req.url)
    }
  }

  // get INVITATION cookie for support RAF
  var cookieInvitation = cookies.invitation_guid;
  // get INVITATION from query
  var invitation = query.invitation;

  if (invitation && invitation != '' && !cookieInvitation) {
      // set INVITATION cookie
    res.cookie('invitation_guid', invitation, {domain, maxAge: maxAge_30_days});
  }

  let showKeys = false;
  if (query.show_keys || req.cookies.show_keys) {
    res.cookie('show_keys', '1');
    showKeys = true;
  }
  res.locals.showKeys = showKeys;

  if (query.regulator && valid_regulator(query.regulator)) {
    res.cookie('regulator', query.regulator);
  }

  if (query.reg_force_branch && valid_regulator(query.reg_force_branch)) {
    // "reg_force_branch" must have priority comparing to "regulator" or similar cookie
    req.regulator = query.reg_force_branch;
    res.cookie('regulator', query.reg_force_branch);
  }

  if (query.reg_force_country) {
    res.cookie('reg_force_country', query.reg_force_country, {maxAge: maxAge_1_day});
  }

  // force redirect to ASIC from icmarkets.com.au, where redirect will go to icmarkets.com/?regulator:1
  // if (typeof query['regulator:1'] !== 'undefined') {
  //   res.cookie('regulator', '1');
  //   res.cookie('country_from', 'au');
  // }

  // force set the country from where user come to website
  if (typeof query['country_from'] !== 'undefined') {
    res.cookie('country_from', query.country_from);
  }

  // transfer the property about redirect from .eu to .com
  if (typeof query['rfeu'] !== 'undefined') {
    res.cookie('redirect_from_eu', 'yes');
  }

  // eu user cookies enable settings
  res.locals.eu_cookies_enabled = req.cookies.eu_cookies_enabled;
  if (res.locals.eu_cookies_enabled == '100' || res.locals.eu_cookies_enabled == '110') {
    let keys = Object.keys(req.cookies)
    keys.map(key => {
      if (key.startsWith('_')) {
        res.clearCookie(key)
      }
    })
  }

  next()
}
