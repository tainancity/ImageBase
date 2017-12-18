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

// ========== Settings ========== //

process.env.NODE_ENV = CONFIG.appenv.env
app.set('view engine', 'pug')
app.set('views', CONFIG.path.views)
app.set('port', process.env.PORT || CONFIG.appenv.port)


app.get('/', function (req, res) {
  res.send('Hello World!')
})

app.listen(app.get('port'), function(){
  console.log(app.get('env') + ': http://localhost:' + app.get('port'));
})
