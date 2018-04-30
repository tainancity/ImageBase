var express = require('express')
//var methodOverride = require('method-override')
require('express-group-routes')
var cors = require('cors')
var app = express()

app.use(cors()) // allow cors

var CONFIG = require('../app/config/global.js')
// ========== Global Middlewares ========== //
app.use(express.static(CONFIG.path.public))
/*
app.get('storage_uploads', function (req, res) {
  res.send('Hello World Storage!')
})
*/

app.listen(CONFIG.appenv.storage.port, function(){
  console.log(CONFIG.appenv.env + ': ' + CONFIG.appenv.storage.domain);
})
