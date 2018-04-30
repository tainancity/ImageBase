var CONFIG = require('../config/global.js')
var fs = require('fs')

exports.log_action = function(app){
  return function(req, res, next){
    var d = new Date();

    var date_str = d.getFullYear() + '_' + (d.getMonth() + 1)
    var log4js = require('log4js')
    var log_filename = CONFIG.path.storage_logs + '/action_' + date_str + '.log'

    log4js.configure({
      appenders: {
        everything: { type: 'file', filename: log_filename }
      },
      categories: {
        default: { appenders: [ 'everything' ], level: 'info' }
      }
    });
    var logger = log4js.getLogger()

    // 檢查 log 檔是否存在，若不存在，則建立
    fs.access(log_filename, (err) => {
      if(err){
        if(err.code === 'ENOENT'){
          //console.log("檔案不存在")
          fs.closeSync(fs.openSync(log_filename, 'w'))
        }
      }
      
      logger.info(req.headers['x-forwarded-for'] || req.ip, '瀏覽了', req.originalUrl, '頁面，使用的 User-Agent：', req.headers['user-agent']);
    })

    next()
  }
}

// logger.info("ip", "page", "user agent");
