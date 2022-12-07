module.exports = url => url.replace(/\?.*$/, '').replace(/(^\/)|(\/$)/g, '')
