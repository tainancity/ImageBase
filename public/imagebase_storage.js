var express = require('express')
//var methodOverride = require('method-override')
require('express-group-routes')
var cors = require('cors')
var app = express()
const exec = require('child_process').exec

app.use(cors()) // allow cors

var CONFIG = require('../app/config/global.js')
// ========== Global Middlewares ========== //
app.use(express.static(CONFIG.path.public))
/*
app.get('storage_uploads', function (req, res) {
  res.send('Hello World Storage!')
})
*/
app.get('/download/trigger', function (req, res) {
  res.download(CONFIG.path.storage_temp + "/" + req.query.download_filename + ".zip", function (err) {
    if (err) {
      console.log(err)
      // Handle error, but keep in mind the response may be partially-sent, so check res.headersSent
    } else {
      console.log("下載完成")
      //console.log((req.query.download_filename).indexOf("."))
      if((req.query.download_filename).indexOf(".") == -1){
        //console.log("yes | rm -r  " + CONFIG.path.storage_temp + "/" + req.query.download_filename + "*")
        exec("yes | rm -r  " + CONFIG.path.storage_temp + "/" + req.query.download_filename + "*", function(error, stdout, stderr){})
      }
    }
  })
})

app.listen(CONFIG.appenv.storage.port, function(){
  console.log(CONFIG.appenv.env + ': ' + CONFIG.appenv.storage.domain);
})
