var formidable = require('formidable')
var fs = require('fs')
var util = require('util')

var CONFIG = require('../config/global.js')
//var userModel = require(CONFIG.path.models + '/user.js')
//var functions = require(CONFIG.path.helpers + '/functions.js')
//var client_scp2 = require('scp2')
var Client = require('scp2').Client;
var client_scp2 = new Client({
  port: 22,
  host: CONFIG.appenv.storage.scp.ip,
  username: CONFIG.appenv.storage.scp.user,
  password: CONFIG.appenv.storage.scp.password
});

// CONFIG.appenv.storage.scp.user + ':' + CONFIG.appenv.storage.scp.password + '@' + CONFIG.appenv.storage.scp.ip

exports.index = function(options) {
  return function(req, res) {
    // { csrfToken: req.csrfToken() }
    var a = 'abctd'
    res.render('frontend/index', {testVar: a})
  }
}

exports.image_upload = function(options){
  return function(req, res){
    //console.log(req.query.d) // 欲建立的資料夾名稱

    // parse a file upload
    var form = new formidable.IncomingForm();
    form.encoding = 'utf-8';
    form.uploadDir = CONFIG.path.storage_uploads + '/' + req.query.d;
    form.keepExtensions = true;
    form.maxFieldsSize = 10 * 1024 * 1024; // 10MB

    if (!fs.existsSync(form.uploadDir)) {
      fs.mkdirSync(form.uploadDir, 0777);
    }


    form.parse(req, function(err, fields, files) {
      var file_ext = files.upload.name.split('.').pop()       // 副檔名
      var file_new_name = 'f_' + Date.now() + '.' + file_ext  // 完整檔案名稱(含副檔名)
      fs.rename(files.upload.path, form.uploadDir + "/" + file_new_name, function(){
        //console.log(form.uploadDir)
        if(CONFIG.appenv.env == 'local'){ // 如果是 local 端，直接回傳
          res.json({
            'uploaded': 1,
            //"fileName": files.upload.name,
            'url': CONFIG.appenv.storage.domain + CONFIG.appenv.storage.path + '/' + req.query.d + '/' + file_new_name
          })
        }else{

          client_scp2.mkdir(CONFIG.appenv.storage.storage_uploads_path + '/' + req.query.d, function(err){
            // 1. 建遠端資料夾
            // 2. 將原圖刪除
            res.json({
              'uploaded': 1,
              //"fileName": files.upload.name,
              'url': CONFIG.appenv.storage.domain + CONFIG.appenv.storage.path + '/' + req.query.d + '/' + file_new_name
            })
            /*
            client_scp2.scp(form.uploadDir + '/' + file_new_name, CONFIG.appenv.storage.scp.user + ':' + CONFIG.appenv.storage.scp.password + '@' + CONFIG.appenv.storage.scp.ip + ':' + CONFIG.appenv.storage.storage_uploads_path + '/g/', function(err) {
              //console.log(err)
              // 移除本機的原檔
              res.json({
                'uploaded': 1,
                //"fileName": files.upload.name,
                'url': CONFIG.appenv.storage.domain + CONFIG.appenv.storage.path + '/' + req.query.d + '/' + file_new_name
              })
            })
            */
          })

        }

      });


      //console.log(files)
      //res.json(files)
      //res.writeHead(200, {'content-type': 'text/plain'});
      //res.write('received upload:\n\n');
      //res.write('this image text:' + fields.this_image_text);
      //res.end(util.inspect({fields: fields, files: files}));
    });


  }
}
