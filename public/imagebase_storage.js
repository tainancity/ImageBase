var express = require('express')
//var methodOverride = require('method-override')
require('express-group-routes')
var app = express()

var CONFIG = require('../app/config/global.js')
// ========== Global Middlewares ========== //
app.use(express.static(CONFIG.path.public))
/*
app.get('storage_uploads', function (req, res) {
  res.send('Hello World Storage!')
})
*/

app.listen(CONFIG.appenv.storage.port, function(){
  console.log(app.get('env') + ': ' + CONFIG.appenv.storage.domain);
})
