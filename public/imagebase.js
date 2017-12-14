var express = require('express')
var methodOverride = require('method-override')
require('express-group-routes')
var app = express()

// ========== Settings ========== //

//process.env.NODE_ENV = CONFIG.appenv.env
//app.set('view engine', 'pug')
//app.set('views', CONFIG.path.views)
app.set('port', process.env.PORT || 3001)


app.get('/', function (req, res) {
  res.send('Hello World!')
})

app.listen(app.get('port'), function(){
  console.log(app.get('env') + ': http://localhost:' + app.get('port'));
})
