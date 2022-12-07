module.exports = (req, res, next) => {
  // console.log(req.url, req.headers)
  // if (~req.url.indexOf('/en/en')) {
    // We currenty can not collect any useful information from request headers
  // console.warn(`Url logging: ${req.url}`)
  // }

  req.query['log_header'] && console.info([
      'log_header id', req.query['log_header'],
      'header', encodeURIComponent(JSON.stringify(req.headers)),
      'process.env.COUNTRY_CODE', process.env.COUNTRY_CODE
    ].join(' '))

  next()
}
