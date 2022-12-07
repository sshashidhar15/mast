module.exports = (req, res, next) =>
  next(req.url.includes('internal_error_test') && new Error('Have to be catched by express and return error status 500'))
