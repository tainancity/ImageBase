var formidable = require('formidable')
var fs = require('graceful-fs')
var util = require('util')

var CONFIG = require('../config/global.js')
//var userModel = require(CONFIG.path.models + '/user.js')
var settingModel = require(CONFIG.path.models + '/setting.js')
//var functions = require(CONFIG.path.helpers + '/functions.js')

// var Client = require('scp2').Client
// var client_scp2 = new Client({
//   port: 22,
//   host: CONFIG.appenv.storage.scp.ip,
//   username: CONFIG.appenv.storage.scp.user,
//   password: CONFIG.appenv.storage.scp.password
// })

let client_ssh = require('ssh2-sftp-client')
let client_ssh_sftp = new client_ssh()

// CONFIG.appenv.storage.scp.user + ':' + CONFIG.appenv.storage.scp.password + '@' + CONFIG.appenv.storage.scp.ip

exports.image_upload = function(options){
  return function(req, res){
    //console.log(req.query.d) // 欲建立的資料夾名稱

    // parse a file upload
    var form = new formidable.IncomingForm()
    form.encoding = 'utf-8'
    form.uploadDir = CONFIG.path.storage_uploads + '/' + req.query.d
    form.keepExtensions = true
    //form.maxFieldsSize = 10 * 1024 * 1024  // 10MB

    if (!fs.existsSync(form.uploadDir)) {
      fs.mkdirSync(form.uploadDir, 0777)
    }


    form.parse(req, function(err, fields, files) {
      var file_ext = files.upload.name.split('.').pop()       // 副檔名
      var file_new_name = 'f_' + Date.now() + '.' + file_ext  // 完整檔案名稱(含副檔名)
      fs.rename(files.upload.path, form.uploadDir + "/" + file_new_name, function(){

        settingModel.getOne('option_name', 'upload_filesize_limit', function(result){

          // result[0].option_value就是後台設定的最大 KB 數，乘上1024轉成多少個 bytes
          if(files.upload.size > (parseInt(result[0].option_value) * 1024)){ // files.upload.size: 873241byte，後台可設定最大上傳多少K，這裡佔定 10M = 10 * 1024 * 1024
            // 將原本機端的檔案刪除
            fs.unlink(form.uploadDir + '/' + file_new_name, (err) => {
              if (err) throw err
              // 回傳圖片路徑
              res.json({
                'uploaded': 0,
                "error": {
                  "message": "檔案過大，無法上傳！"
                }
              })
            })
          }else{
            if(CONFIG.appenv.env == 'local' || CONFIG.appenv.env == 'staging'){ // 如果是 local 端，直接回傳

              res.json({
                'uploaded': 1,
                //"fileName": files.upload.name,
                'url': CONFIG.appenv.storage.domain + CONFIG.appenv.storage.path + '/' + req.query.d + '/' + file_new_name
              })

            }else{

              // 建遠端資料夾
              /*
              client_scp2.mkdir(CONFIG.appenv.storage.storage_uploads_path + '/' + req.query.d, function(err){
                // 傳圖至 Storage
                client_scp2.upload(form.uploadDir + '/' + file_new_name, CONFIG.appenv.storage.storage_uploads_path + '/' + req.query.d + '/' + file_new_name, function(){

                  // 將原本機端的檔案刪除
                  fs.unlink(form.uploadDir + '/' + file_new_name, (err) => {
                    if (err) throw err
                    // 回傳圖片路徑
                    res.json({
                      'uploaded': 1,
                      // "fileName": files.upload.name,
                      'url': CONFIG.appenv.storage.domain + CONFIG.appenv.storage.path + '/' + req.query.d + '/' + file_new_name
                    })
                  })

                })

                // client_scp2.scp(form.uploadDir + '/' + file_new_name, CONFIG.appenv.storage.scp.user + ':' + CONFIG.appenv.storage.scp.password + '@' + CONFIG.appenv.storage.scp.ip + ':' + CONFIG.appenv.storage.storage_uploads_path + '/g/', function(err) {})
              })
              */




              client_ssh_sftp.connect({
                host: CONFIG.appenv.storage.scp.ip,
                port: 22,
                username: CONFIG.appenv.storage.scp.user,
                password: CONFIG.appenv.storage.scp.password
              }).then(() => {
                return client_ssh_sftp.exists(CONFIG.appenv.storage.storage_uploads_path + '/' + req.query.d + "/dd");
              }).then((data) => {
                if(data == "d"){ // 表示該資料夾已存在
                  console.log("here exist");
                  return Promise.resolve(1);
                }else{
                  console.log("here not exist");
                  let remoteDir = CONFIG.appenv.storage.storage_uploads_path + '/' + req.query.d + "/dd";
                  return client_ssh_sftp.mkdir(remoteDir, true);
                }
              }).then(() => {
                console.log("here exist2");
                let localFile = form.uploadDir + '/' + file_new_name;
                let remoteFile = CONFIG.appenv.storage.storage_uploads_path + '/' + req.query.d + '/' + file_new_name;
                return client_ssh_sftp.fastPut(localFile, remoteFile);
              }).then(() => {
                console.log("執行到這end");
                // 將原本機端的檔案刪除
                fs.unlink(form.uploadDir + '/' + file_new_name, (err) => {
                  if (err) throw err
                  // 回傳圖片路徑
                  res.json({
                    'uploaded': 1,
                    // "fileName": files.upload.name,
                    'url': CONFIG.appenv.storage.domain + CONFIG.appenv.storage.path + '/' + req.query.d + '/' + file_new_name
                  })
                })
                return client_ssh_sftp.end();
              }).catch(err => {
                console.log("error");
                console.log(err);
              });














            }
          }
        })

      })


      //console.log(files)
      //res.json(files)
      //res.writeHead(200, {'content-type': 'text/plain'})
      //res.write('received upload:\n\n')
      //res.write('this image text:' + fields.this_image_text)
      //res.end(util.inspect({fields: fields, files: files}))
    })

  }
}
