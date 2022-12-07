require('dotenv').config();
const express = require('express')
const path = require('path')
const cookieParser = require('cookie-parser')
const sassMiddleware = require('node-sass-middleware')
const i18n = require('i18n-2')
const expressLayouts = require('express-ejs-layouts')
const lang = require('./routes/lang')
const internalErrorTest = require('./routes/internal_error_test')
const regulators = require('./routes/regulators')
const translator = require('./routes/translator')
const auth = require('./routes/auth')
const bundler = require('./routes/bundler')
const cookies = require('./routes/cookies')
const routerLogger = require('./routes/logger')
const seoRedirects = require('./routes/seo_redirects')
const perHostRedirects = require('./routes/per_host_redirects')
const perBranchRedirects = require('./routes/per_branch_redirects')
const outsideRedirects = require('./routes/outside_redirects')
const translation_updates = require('./routes/translation_updates')
const admin = require('./routes/admin')
const config = require('./config')
const generateRoutes = require('./utils/generateRoutes')
const routes = generateRoutes(config.routes)

const moment = require('moment')
const url2route = require('./utils/url2route')
const subscribe_on_redis = require('./utils/subscribe_on_redis')
const futures_middleware = require('./routes/futures')
const futures_model = require('./models/futures')
const faq_sections = require('./models/faq_sections')
const translation = require('./models/translation')
const online = require('./models/online')
const page_by_key = require('./models/page_by_key')
const index = require('./routes/index')
const regapi = require('./routes/regapi')
//const robotsTxt = require('express-robots.txt')

console.info('redis_host: process.env.REDIS_DB_HOST=[' + process.env.REDIS_DB_HOST + '], config.redis_host=[' + config.redis_host + ']')
console.info('redis_port: process.env.REDIS_DB_PORT=[' + process.env.REDIS_DB_PORT + '], config.redis_port=[' + config.redis_port + ']')

console.info('reg_host_1: process.env.REG_HOST_1=[' + process.env.REG_HOST_1 + '], config.reg_service_1_url=[' + config.reg_service_1_url + ']')
console.info('reg_host_2: process.env.REG_HOST_2=[' + process.env.REG_HOST_2 + '], config.reg_service_2_url=[' + config.reg_service_2_url + ']')

// const allowedDomains = ["www.icmarkets.com" , "www.icmarkets.sc", "www.icmarkets.bs", "icmarkets.com" , "icmarkets.sc", "icmarkets.bs"];
// const robotsTxtHandler = robotsTxt(allowedDomains);

const app = express();
const startDT = moment().format("DD/MM/YYYY HH:mm:ss");
console.info('Server app start at: ' + startDT);

const options = {
  maxAge: 3600000,
  setHeaders: function (res) {
    res.set({
      'x-timestamp': Date.now()
    })
  }
}

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.set('layout', '_layouts/index');
app.set('layout extractStyles', true)
app.set('layout extractScripts', true)
app.set('layout extractMetas', true)

// app.use(robotsTxtHandler);

app.use(express.json({limit: '500mb'}));
app.use(express.urlencoded({limit: '500mb', extended: false}));
app.use(function(req, res, next) {
  res.locals.startDT = startDT;
  res.locals.app = app;
  next();
});
app.use(cookieParser());

app.use('/regapi', regapi);

app.use(sassMiddleware({
  src: path.join(__dirname, 'public'),
  dest: path.join(__dirname, 'public'),
  indentedSyntax: true, // true = .sass and false = .scss
  sourceMap: process.env.NODE_ENV !== 'production'
}));


// app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public'), options));

module.exports = () =>
subscribe_on_redis()
.then(() =>
  Promise.all([
    translation.load_in_memory_state_for_all_regulators(),
    futures_model.load_from_db(),
    faq_sections.load(),
    online.load(),
    page_by_key.load()
  ])
)
.then(() => {
  console.info('LOCALES READY')
  app.use(routerLogger);
  app.get('/health', function(req, res) {
    res.status(200).end()
  })
  app.get('/chat-bot', function(req, res) {
    console.info('CHAT-BOT')
    res.status(200).end()
  })
  app.get('/commit', function(req, res) {
    res.status(200).end(process.env.COMMIT)
  })
  app.use(internalErrorTest);
  app.use(cookies);
  app.use(auth);
  app.get('/CURRENT/:regulator/:lang', (req, res) =>
      res.locals.isManager && res.end(translation.get_current_by_lang_binary(req.params.regulator, req.params.lang), 'binary')
  )
  app.use(regulators);
  app.use(translation_updates);
  app.use(function (req, res, next) {
    req.i18n = new i18n({
      cookieName: 'user_want_language',
      locales: translation.get_current(req.regulator),
      request: req,
      parse: null,
      dump: null
    })
    i18n.registerMethods(res.locals, req)
    next()
  })

  app.use(seoRedirects);
  app.use(expressLayouts);
  app.use(futures_middleware)
  app.use(lang(routes));
  app.use(translator);
  app.use('/admin', admin)
  app.use(bundler.middleware);
  app.use((req, res, next) => {
    next()
  })
  app.use(perHostRedirects);
  app.use(perBranchRedirects);
  app.use(outsideRedirects);
  app.use(index(routes));

  // catch 404 and forward to error handler
  // app.use(function(req, res, next) {
  //  next(createError(res.statusCode));
  // });

  // error handler
  // eslint-disable-next-line
  app.use(function(err, req, res, next) {
    if (err) {
      console.error('route: ' + url2route(req.url))
      console.error(err.toString())
      console.error(String(JSON.stringify(err)))
      res.locals.message = err.message;
      res.locals.error = err;
    }
    if (res.statusCode === 404) {
      return res.render('_404')
    }
    res.status(500);
    res.locals.layout = '_layouts/500'
    res.render('_error');
  });

  return Promise.resolve(app)
})
.catch(err => {
  console.error(err && err.toString())
  console.error(err && err.stack && err.stack.toString())
  process.exit(1)
})
