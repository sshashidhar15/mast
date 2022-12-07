const toFlat = require('./toFlat')
class T {
  constructor(i18n, isTranslator, isManager, isEditing, app) {
    this.$t = this.$t.bind(this)
    this.setI18nPrefix = this.setI18nPrefix.bind(this)
    this.prevI18nPrefix = this.prevI18nPrefix.bind(this)
    this.i18n = i18n
    this.app = app
    this.isTranslator = isTranslator
    this.isManager = isManager
    this.isEditing = isEditing
    this.untranslated_keys = []
    if (!app.never_used_keys) {
      app.never_used_keys = toFlat(i18n.locales.en)
      app.already_used_keys = {}
      app.total_keys_count = Object.keys(app.never_used_keys).length
    }
  }

  // eslint-disable-next-line complexity
  $t(path, do_not_edit, en, wrap_to_span) {
      var tmp = this.i18n.locale;
      if (en) this.i18n.setLocale('en')

    let biggest_path = [this.prefix, path].filter(i => !!i).join('.')

    let is_global = false;
    if (do_not_edit) is_global = this.i18n.__(biggest_path) === path;

    let resPath = this.untranslated_keys.includes(path) || is_global
      ? path
      : biggest_path

    let result = this.i18n.__(resPath)

    if (do_not_edit) this.untranslated_keys.push(resPath)

    if (result === path) {
      resPath = path
      result = this.i18n.__(path)
    }

    try {
      const used = this.app.already_used_keys[resPath] ? this.app.already_used_keys[resPath] + 1 : 1
      this.app.already_used_keys[resPath] = used
      delete this.app.never_used_keys[resPath]
    // eslint-disable-next-line no-empty
    } catch (e) {}

    if (result === path && !/^[a-z][0-9]+$/.test(path)) {
      throw new Error(`MISSING KEY! ${resPath} for locale ${this.i18n.locale.toUpperCase()}`)
    }

    this.i18n.setLocale(tmp);

    let countryCode = this.i18n.request.res.locals.countryCode;
    if (countryCode === 'cn') {
      result = result.replace(/\.icmarkets\.com/g, '.icmarkets-zhv.com').replace(/\/icmarkets\.com/g, '/icmarkets-zhv.com');
    } else if (countryCode === 'it') {
      result = result.replace(/\.icmarkets\.com/g, '.icmarkets.eu').replace(/\/icmarkets\.com/g, '/icmarkets.eu');
    }

    let return_res = result;
    let showKeys = this.i18n.request.res.locals.showKeys;

    if (this.isTranslator && !do_not_edit) {
      var value = result.trim().replace(/&nbsp;/g, '');
      if (!value.startsWith('<') || !value.endsWith('>')) {
          value = '<p>' + value + '</p>';
      }

      // NOTE: parent tag where we need to append the contenteditable element must support this element tag!
      if (wrap_to_span) {
        // P, H1 and other non-block tags are support only SPAN element inside
        return_res = `<span style="display:block;" class="translator-editor" data-t-key="${resPath}" ${this.isEditing ? 'contenteditable' : ''}>${value}</span>`;
      } else {
        // Only parent DIV and A tags are support DIV element inside
        return_res = `<div style="display:block;" class="translator-editor" data-t-key="${resPath}" ${this.isEditing ? 'contenteditable' : ''}>${value}</div>`;
      }
    } else if (showKeys && return_res && !do_not_edit) {
      return_res = `<i x>${resPath}</i>${return_res}`;
    }
    return return_res;
  }

  setI18nPrefix(prefix) {
    this.prev = this.prefix
    this.prefix = prefix
  }

  prevI18nPrefix() {
    this.prefix = this.prev
  }
}

module.exports = T
