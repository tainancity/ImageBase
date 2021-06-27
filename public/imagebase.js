var express = require('express')
require('express-group-routes')
var app = express()

var fs = require('graceful-fs')

var path = require('path')
var cookieParser = require('cookie-parser')
var session = require('express-session')
var flash = require('req-flash')
var RedisStore = require('connect-redis')(session)
var bodyParser = require('body-parser')
var csrf = require('csurf')
var helmet = require('helmet')
var methodOverride = require('method-override')

var CONFIG = require('../app/config/global.js')
var functions = require(CONFIG.path.helpers + '/functions.js')
var static = require(CONFIG.path.helpers + '/static.js')
var time = require(CONFIG.path.helpers + '/time.js')

var yamlApiSpec = require(CONFIG.path.yaml + '/api_spec.js')
const { v4: uuidv4 } = require('uuid');
// ========== Settings ========== //

app.set('view engine', 'pug')
app.set('views', CONFIG.path.views)
app.set('port', CONFIG.appenv.port)

// 檢查 public/yaml/api_spec.yaml 是否存在，若不存在，則建立
fs.access(CONFIG.path.public + '/yaml/api_spec.yaml', (err) => {
  if(err){
    if(err.code === 'ENOENT'){
      //console.log("檔案不存在")
      yamlApiSpec.generate_api_spec()
    }
  }
})

// ========== View Variables ========== //

app.locals.asset_path = static.asset_path
app.locals.decrypt = static.decrypt

app.locals.functions = functions
app.locals.time = time
app.locals.config = CONFIG

// ========== Global Middlewares ========== //
app.use(function(req, res, next){
  //console.log("test middleware")
  next()
})
app.use(require(CONFIG.path.middlewares + '/ban_ips').ban_ips(app)) // ban ips
app.use(express.static(CONFIG.path.public))
app.use(helmet())
app.use(cookieParser())

//app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json({
  limit: '50mb'
}));
app.use(bodyParser.urlencoded({
  extended: true,
  limit: '50mb'
}));
//app.use(express.json({limit: '50mb'}));

app.use(methodOverride(function (req, res) {
  if (req.body && typeof req.body === 'object' && '_method' in req.body) {
    // look in urlencoded POST bodies and delete it
    var method = req.body._method
    delete req.body._method
    return method
  }
}))

app.use(session({
  key: CONFIG.appenv.sessionCookieName,
  genid: function(req) {
    return uuidv4(); // use UUIDs for session IDs
  },
  secret: CONFIG.appenv.cookieSessionSecret,
  store: new RedisStore({ host: CONFIG.appenv.redis.host, port: CONFIG.appenv.redis.port, pass: CONFIG.appenv.redis.password}),
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: false
  }
}))

// 放在這裡的原因是此圖片 api 不需要經過 csrfToken。
require(CONFIG.path.routes + '/api-image')(app)

app.use(csrf({ cookie: true }))
app.use(flash({ locals: 'flash' }))

// ========== Custom Middlewares ========== //
app.use(require(CONFIG.path.middlewares + '/rm_trailing_slash').rm_trailing_slash(app)) // Disable trailing slash
//app.use(require(CONFIG.path.middlewares + '/lang').custom_lang(app))                  // language setting
app.use(require(CONFIG.path.middlewares + '/is_maintenance_mode').is_maintenance_mode(app))
app.use(require(CONFIG.path.middlewares + '/global').global(app))                     // view global functions and variables
app.use(require(CONFIG.path.middlewares + '/auth').setting_locals(app))
app.use(require(CONFIG.path.middlewares + '/ga').get_ga_code(app))
app.use(require(CONFIG.path.middlewares + '/get_logo_path').get_logo_path(app))
//app.use(require(CONFIG.path.logger + '/log_action').log_action(app))

// ========== Routes ========== //
require(CONFIG.path.routes + '/api-ajax')(app)
require(CONFIG.path.routes + '/web')(app)

// ========== Listen ========== //
app.listen(app.get('port'), function(){
  console.log(CONFIG.appenv.env + ': ' + CONFIG.appenv.domain)
})
