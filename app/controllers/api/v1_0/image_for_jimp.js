var formidable = require('formidable')
var fs = require('fs')
var Jimp = require("jimp")

var CONFIG = require('../../../config/global.js')
var settingModel = require(CONFIG.path.models + '/setting.js')
var apiKeyModel = require(CONFIG.path.models + '/api_key.js')
var userModel = require(CONFIG.path.models + '/user.js')
var fileModel = require(CONFIG.path.models + '/file.js')
var tagModel = require(CONFIG.path.models + '/tag.js')
var fileTagModel = require(CONFIG.path.models + '/file_tag.js')

var functions = require(CONFIG.path.helpers + '/functions.js')

var Client = require('scp2').Client
var client_scp2 = new Client({
  port: 22,
  host: CONFIG.appenv.storage.scp.ip,
  username: CONFIG.appenv.storage.scp.user,
  password: CONFIG.appenv.storage.scp.password
})


var u_id_duplicate = false
var u_id_duplicate_times = 0
var unique_id
var code_num = 4 // 資料庫裡 u_id 的位數
var saved_obj
var have_the_same_u_id = function(u_id, cb){
  fileModel.getOne('u_id', u_id, function(results_check){
    if(results_check.length == 1){
      u_id_duplicate = true
      u_id_duplicate_times += 1
    }else{
      u_id_duplicate = false
    }
    cb()
  })
}

var duplicate_func = function(req, res, fields, data_files){
  if(u_id_duplicate){
    //console.log("重新產生新的u_id")
    if(u_id_duplicate_times >= 3){ // 重覆跑超過三次之後，將位數增加
      code_num += 1
    }
    unique_id = functions.generate_random_code(code_num)
    have_the_same_u_id(unique_id, function(){
      duplicate_func(req, res, fields, data_files)
    })
  }else{
    saved_obj.u_id = unique_id
    fileModel.save(saved_obj, true, function(save_results){

      // 儲存 tags
      if(fields.tags != undefined && ((fields.tags).trim()).length > 0){
        save_tags((fields.tags).trim(), save_results.insertId)
      }

      //CONFIG.appenv.storage.domain + CONFIG.appenv.storage.path + '/' + basic_upload_dir + '/' + fields.category + '/' + file_new_name
      res.status(200).json({
        code: 200,
        data:{
          short_url: CONFIG.appenv.domain + '/f/' + unique_id,
          files: data_files
        }
      })

    })

  }
}

// save tags
var save_tags = function(tags_str, fileid){
  var tags_array = tags_str.split(',')
  tags_array.forEach(function(tag_item, tag_index, tag_arr){
    tagModel.getOne("tag_name", tag_item, function(find_tags_result){
      if(find_tags_result.length > 0){
        var sort_obj = { "column": "id", "sort_type": "DESC" }
        var where_obj1 = { "column_name": "file_id", "operator": "=", "column_value": fileid }
        var where_obj2 = { "column_name": "tag_id", "operator": "=", "column_value": find_tags_result[0].id }
        fileTagModel.getAll2Where(sort_obj, where_obj1, where_obj2, function(file_tag_result){
          if(file_tag_result.length == 0){
            fileTagModel.save({"file_id": fileid, "tag_id": find_tags_result[0].id}, false, function(){})
          }
        })
      }else{
        tagModel.save({tag_name: tag_item}, false, function(tag_result){
          var sort_obj = { "column": "id", "sort_type": "DESC" }
          var where_obj1 = { "column_name": "file_id", "operator": "=", "column_value": fileid }
          var where_obj2 = { "column_name": "tag_id", "operator": "=", "column_value": tag_result.insertId }
          fileTagModel.getAll2Where(sort_obj, where_obj1, where_obj2, function(file_tag_result){
            if(file_tag_result.length == 0){
              fileTagModel.save({"file_id": fileid, "tag_id": tag_result.insertId}, false, function(){})
            }
          })

        })
      }
    })

  })
}

exports.image_post = function(options){

  return function(req, res){

    if(req.query.api_key == undefined){
      res.status(403).json({code: 403, msg:'未提供 API Key'})
    }else{

      apiKeyModel.getOne('api_key', req.query.api_key, function(results){
        if(results.length > 0 || req.query.api_key == CONFIG.appenv.full_api_key){
          if(results.length > 0){
            // 將此 api_key 的 request_times 次數加 1
            apiKeyModel.update({'request_times': results[0].request_times + 1}, {'api_key': req.query.api_key}, true, function(){})
          }

          // parse a file upload
          var form = new formidable.IncomingForm()
          form.encoding = 'utf-8'
          form.keepExtensions = true
          //form.maxFieldsSize = 10 * 1024 * 1024  // 10MB

          form.parse(req, function(err, fields, files) {

            var file_ext = files.upload.name.split('.').pop()  // 副檔名
            if( file_ext == "jpeg" || file_ext == "jpg" || file_ext == "png" || file_ext == "gif" ){
              var file_type_num = 1
            }
            if(file_ext == "pdf"){
              var file_type_num = 2
            }

            switch(file_type_num) {
              case 1:
                var api_upload_dir = 'a' // api 上傳的資料夾
                var basic_upload_dir = CONFIG.path.storage_uploads + '/' + api_upload_dir
                var file_save_path = CONFIG.appenv.storage.path + '/' + api_upload_dir + '/' + fields.category
                form.uploadDir = CONFIG.path.storage_uploads + '/' + api_upload_dir + '/' + fields.category
                if (!fs.existsSync(basic_upload_dir)) {
                  fs.mkdirSync(basic_upload_dir, 0777)
                }
                if (!fs.existsSync(form.uploadDir)) {
                  fs.mkdirSync(form.uploadDir, 0777)
                }

                var current_timestamp = Date.now()
                var file_new_name = results[0].user_id + '_' + current_timestamp + '_original' + '.' + file_ext  // 完整檔案名稱(含副檔名)
                var generated_filename = [
                  results[0].user_id + '_' + current_timestamp + '_320.' + file_ext,
                  results[0].user_id + '_' + current_timestamp + '_640.' + file_ext,
                  results[0].user_id + '_' + current_timestamp + '_960.' + file_ext
                ]

                fs.rename(files.upload.path, form.uploadDir + "/" + file_new_name, function(){

                  settingModel.getOne('option_name', 'upload_filesize_limit', function(result){

                    // result[0].option_value就是後台設定的最大 KB 數，乘上1024轉成多少個 bytes
                    if(files.upload.size > (parseInt(result[0].option_value) * 1024)){ // files.upload.size: 873241byte，後台可設定最大上傳多少K，這裡佔定 10M = 10 * 1024 * 1024
                      // 將原本機端的檔案刪除
                      fs.unlink(form.uploadDir + '/' + file_new_name, (err) => {
                        if (err) throw err
                        // 回傳圖片路徑
                        res.status(403).json({ code: 403, error: { 'message': '檔案過大，無法上傳！' } })
                      })
                    }else{
                      //if(CONFIG.appenv.env == 'local'){ // 如果是 local 端，直接回傳
                        var data_files = []
                        var data_files_save = []

                        Jimp.read(form.uploadDir + '/' + file_new_name, function(err_ini_origin, info_ini_origin){
                          if (err_ini_origin) throw err_ini_origin

                          info_ini_origin.exifRotate().write(form.uploadDir + '/' + file_new_name, function(err_origin, info_origin){

                            var stats = fs.statSync(form.uploadDir + '/' + file_new_name)

                            var json_origin_data = {
                              format: file_ext,
                              width: info_origin.bitmap.width,
                              height: info_origin.bitmap.height,
                              size: stats.size,
                              origin: true
                            }
                            var saved_origin_data = JSON.parse(JSON.stringify(json_origin_data));

                            saved_origin_data.url = CONFIG.appenv.storage.path + '/' + api_upload_dir + '/' + fields.category + '/' + file_new_name
                            json_origin_data.url = CONFIG.appenv.storage.domain + CONFIG.appenv.storage.path + '/' + api_upload_dir + '/' + fields.category + '/' + file_new_name

                            data_files.push(json_origin_data)
                            data_files_save.push(saved_origin_data)

                            // 重這開始
                            generated_filename.forEach(function(item, index, arr) {
                              var split_item = item.split('_')
                              var setting_width = ((split_item[2]).split('.'))[0] // 寬度

                              Jimp.read(form.uploadDir + '/' + file_new_name, function(err_for_jimp_img, info_for_jimp_img){
                                if (err_for_jimp_img) throw err_for_jimp_img

                                info_for_jimp_img.resize(parseInt(setting_width), Jimp.AUTO).write(form.uploadDir + '/' + item, function(err, info){
                                  var stats = fs.statSync(form.uploadDir + '/' + item)
                                  var json_data = {
                                    format: file_ext,
                                    width: info.bitmap.width,
                                    height: info.bitmap.width,
                                    size: stats.size,
                                    origin: false
                                  }
                                  var saved_data = JSON.parse(JSON.stringify(json_data));

                                  saved_data.url = CONFIG.appenv.storage.path + '/' + api_upload_dir + '/' + fields.category + '/' + item
                                  json_data.url = CONFIG.appenv.storage.domain + CONFIG.appenv.storage.path + '/' + api_upload_dir + '/' + fields.category + '/' + item

                                  data_files_save.push(saved_data)
                                  data_files.push(json_data)

                                  if(index+1 == generated_filename.length){

                                    userModel.getOne('id', results[0].user_id, function(user_results){

                                      saved_obj = {
                                        //u_id: Math.floor((Math.random() * 10000) + 1),
                                        user_id: parseInt(user_results[0].id),
                                        category_id: parseInt(fields.category),
                                        organ_id: user_results[0].organ_id,
                                        title: fields.title,
                                        file_type: file_type_num,
                                        file_path: file_save_path,
                                        file_ext: file_ext,
                                        file_data: JSON.stringify(data_files_save),
                                        pageviews: 0,
                                        permissions: fields.permissions
                                      }

                                      unique_id = functions.generate_random_code(code_num)
                                      have_the_same_u_id(unique_id, function(){
                                        duplicate_func(req, res, fields, data_files)
                                      })

                                      if(CONFIG.appenv.env != 'local'){
                                        // 建遠端資料夾
                                        client_scp2.mkdir(CONFIG.appenv.storage.storage_uploads_path + '/' + api_upload_dir, function(err){
                                          client_scp2.mkdir(CONFIG.appenv.storage.storage_uploads_path + '/' + api_upload_dir + '/' + fields.category, function(err){

                                            // 傳原圖至 Storage
                                            client_scp2.upload(form.uploadDir + '/' + file_new_name, CONFIG.appenv.storage.storage_uploads_path + '/' + api_upload_dir + '/' + fields.category + '/' + file_new_name, function(){

                                              // 將原本機端的原檔案刪除
                                              fs.unlink(form.uploadDir + '/' + file_new_name, (err) => {
                                                if (err) throw err
                                              })

                                              // 傳縮圖至 Storage，然後刪除
                                              generated_filename.forEach(function(generated_item, generated_index, generated_arr) {
                                                client_scp2.upload(form.uploadDir + '/' + generated_item, CONFIG.appenv.storage.storage_uploads_path + '/' + api_upload_dir + '/' + fields.category + '/' + generated_item, function(){
                                                  fs.unlink(form.uploadDir + '/' + generated_item, (err) => {
                                                    console.log("完成")
                                                    if (err) throw err
                                                  })
                                                })
                                              })

                                            })
                                          })
                                        })
                                      }

                                    })




                                  }
                                })
                              })


                            })





                          })
                        })


                    }
                  })

                })
                break;
              case 2:
                var api_upload_dir = 'o' // api 上傳的資料夾(非圖片)
                var basic_upload_dir = CONFIG.path.storage_uploads + '/' + api_upload_dir
                var file_save_path = CONFIG.appenv.storage.path + '/' + api_upload_dir + '/' + fields.category
                form.uploadDir = CONFIG.path.storage_uploads + '/' + api_upload_dir + '/' + fields.category
                if (!fs.existsSync(basic_upload_dir)) {
                  fs.mkdirSync(basic_upload_dir, 0777)
                }
                if (!fs.existsSync(form.uploadDir)) {
                  fs.mkdirSync(form.uploadDir, 0777)
                }

                var current_timestamp = Date.now()
                var file_new_name = results[0].user_id + '_' + current_timestamp + '_original' + '.' + file_ext  // 完整檔案名稱(含副檔名)

                fs.rename(files.upload.path, form.uploadDir + "/" + file_new_name, function(){

                  settingModel.getOne('option_name', 'upload_filesize_limit', function(result){

                    // result[0].option_value就是後台設定的最大 KB 數，乘上1024轉成多少個 bytes
                    if(files.upload.size > (parseInt(result[0].option_value) * 1024)){ // files.upload.size: 873241byte，後台可設定最大上傳多少K，這裡佔定 10M = 10 * 1024 * 1024
                      // 將原本機端的檔案刪除
                      fs.unlink(form.uploadDir + '/' + file_new_name, (err) => {
                        if (err) throw err
                        // 回傳圖片路徑
                        res.status(403).json({ code: 403, error: { 'message': '檔案過大，無法上傳！' } })
                      })
                    }else{
                      //if(CONFIG.appenv.env == 'local'){ // 如果是 local 端，直接回傳
                        var data_files = []
                        var data_files_save = []

                        var json_origin_data = {
                          format: files.upload.type,
                          size: files.upload.size,
                          origin: true
                        }
                        var saved_origin_data = JSON.parse(JSON.stringify(json_origin_data));

                        saved_origin_data.url = CONFIG.appenv.storage.path + '/' + api_upload_dir + '/' + fields.category + '/' + file_new_name
                        json_origin_data.url = CONFIG.appenv.storage.domain + CONFIG.appenv.storage.path + '/' + api_upload_dir + '/' + fields.category + '/' + file_new_name

                        data_files.push(json_origin_data)
                        data_files_save.push(saved_origin_data)

                        userModel.getOne('id', results[0].user_id, function(user_results){

                          saved_obj = {
                            //u_id: Math.floor((Math.random() * 10000) + 1),
                            user_id: parseInt(user_results[0].id),
                            category_id: parseInt(fields.category),
                            organ_id: user_results[0].organ_id,
                            title: fields.title,
                            file_type: file_type_num,
                            file_path: file_save_path,
                            file_ext: file_ext,
                            file_data: JSON.stringify(data_files_save),
                            pageviews: 0,
                            permissions: fields.permissions
                          }

                          unique_id = functions.generate_random_code(code_num)
                          have_the_same_u_id(unique_id, function(){
                            duplicate_func(req, res, fields, data_files)
                          })

                          if(CONFIG.appenv.env != 'local'){
                            // 建遠端資料夾
                            client_scp2.mkdir(CONFIG.appenv.storage.storage_uploads_path + '/' + api_upload_dir, function(err){
                              client_scp2.mkdir(CONFIG.appenv.storage.storage_uploads_path + '/' + api_upload_dir + '/' + fields.category, function(err){

                                // 傳原圖至 Storage
                                client_scp2.upload(form.uploadDir + '/' + file_new_name, CONFIG.appenv.storage.storage_uploads_path + '/' + api_upload_dir + '/' + fields.category + '/' + file_new_name, function(){

                                  // 將原本機端的原檔案刪除
                                  fs.unlink(form.uploadDir + '/' + file_new_name, (err) => {
                                    if (err) throw err
                                  })

                                  // 傳縮圖至 Storage，然後刪除
                                  generated_filename.forEach(function(generated_item, generated_index, generated_arr) {
                                    client_scp2.upload(form.uploadDir + '/' + generated_item, CONFIG.appenv.storage.storage_uploads_path + '/' + api_upload_dir + '/' + fields.category + '/' + generated_item, function(){
                                      fs.unlink(form.uploadDir + '/' + generated_item, (err) => {
                                        console.log("完成")
                                        if (err) throw err
                                      })
                                    })
                                  })

                                })
                              })
                            })
                          }

                        })



                      //}
                    }
                  })

                })
                break;
              default:
                res.status(403).json({ code: 403, error: { 'message': '檔案類型不支援！(非圖片限 PDF)' } })
            }

          })

        }else{
          res.status(403).json({code: 403, msg:'未經授權的 API Key'})
        }
      })


    }



  }
}
