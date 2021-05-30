var CONFIG = require('../../config/global.js')
//var functions = require(CONFIG.path.helpers + '/functions.js')

var path = require('path')
var fs = require('graceful-fs')

exports.log_action = function(options){
  return function(req, res){
    var all_action_logs = []
    fs.readdirSync(CONFIG.path.storage_logs).forEach(file => {
      if(file.includes("action_")){ // 檔名有包含 action_ 才算
        all_action_logs.push(file)
      }
    })
    var file_content = ''
    if(req.query.f != undefined){
      fs.readFile(CONFIG.path.storage_logs + '/' + req.query.f, function read(err, data) {
          if (err) throw err

          file_content = data

          //console.log(file_content)
          res.render('admin/logs/log_action', {all_action_logs: all_action_logs, file_content: file_content})
      })
    }else{
      res.render('admin/logs/log_action', {all_action_logs: all_action_logs, file_content: file_content})
    }

  }
}
