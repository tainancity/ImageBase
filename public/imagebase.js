var express = require('express')
var methodOverride = require('method-override')
require('express-group-routes')
var app = express()

var path = require('path')
var cookieParser = require('cookie-parser')
var session = require('express-session')
var flash = require('req-flash');
var RedisStore = require('connect-redis')(session)
var bodyParser = require('body-parser')
var csrf = require('csurf')
var helmet = require('helmet')

var CONFIG = require('../app/config/global.js')
var functions = require(CONFIG.path.helpers + '/functions.js')
var static = require(CONFIG.path.helpers + '/static.js')
var time = require(CONFIG.path.helpers + '/time.js')
// ========== Settings ========== //

process.env.NODE_ENV = CONFIG.appenv.env
app.set('view engine', 'pug')
app.set('views', CONFIG.path.views)
app.set('port', process.env.PORT || CONFIG.appenv.port)

app.locals.asset_path = static.asset_path
app.locals.i18n = static.i18n
app.locals.decrypt = static.decrypt

app.locals.functions = functions
app.locals.time = time
app.locals.config = CONFIG

// ========== Global Middlewares ========== //
app.use(express.static(CONFIG.path.public))
app.use(helmet())
app.use(cookieParser())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(methodOverride(function (req, res) {
  if (req.body && typeof req.body === 'object' && '_method' in req.body) {
    // look in urlencoded POST bodies and delete it
    var method = req.body._method;
    delete req.body._method;
    return method;
  }
}))
app.use(csrf({ cookie: true }))

app.use(session({
  key: CONFIG.appenv.sessionCookieName,
  secret: CONFIG.appenv.cookieSessionSecret,
  //store: new RedisStore({
  //  host: CONFIG.appenv.redis.host,
  //  port: CONFIG.appenv.redis.port,
  //  pass: CONFIG.appenv.redis.password
  //}),
  resave: false,
  saveUninitialized: false
}))
app.use(flash({ locals: 'flash' }))

/*
app.get('/', function (req, res) {
  res.send('Hello World!')
  var soap = require('soap');
  var url = 'http://notes.carlos-studio.com/soap/demo.wsdl';
  var args = {"ibm": ""};

  soap.createClient(url, function(err, client) {
    console.log(client);
    //console.log(client.getWeatherAsync('ibm'))
    client.getWeather({name: 'ibm'}, function(err, result, raw, soapHeader) {
      // result is a javascript object
      // raw is the raw response
      // soapHeader is the response soap header as a javascript object
      console.log(result.value.$value);
    })
    //client.getWeather(args, function(err, result) {
      console.log(err);
      //console.log(result);
      //res.send('Hello World!22')
    //});
  })
})
*/


// ========== Custom Middlewares ========== //
// Disable trailing slash
app.use(require(CONFIG.path.middlewares + '/rm_trailing_slash').rm_trailing_slash(app))
// language setting
app.use(require(CONFIG.path.middlewares + '/lang').custom_lang(app))
// view global functions and variables
app.use(require(CONFIG.path.middlewares + '/global').global(app))
// Auth
app.use(require(CONFIG.path.middlewares + '/auth').setting_locals(app))

// ========== Routes ========== //
require(CONFIG.path.routes + '/web')(app)
require(CONFIG.path.routes + '/api-ajax')(app)

// ========== Listen ========== //
app.listen(app.get('port'), function(){
  console.log(app.get('env') + ': http://localhost:' + app.get('port'));
})
