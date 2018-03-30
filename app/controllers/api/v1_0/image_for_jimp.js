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
var fileLikeModel = require(CONFIG.path.models + '/file_like.js')
var fileCarouselModel = require(CONFIG.path.models + '/file_carousel.js')
var organizationModel = require(CONFIG.path.models + '/organization.js')
var fileCategoryModel = require(CONFIG.path.models + '/file_category.js')

var functions = require(CONFIG.path.helpers + '/functions.js')

var Client = require('scp2').Client
var client_scp2 = new Client({
  port: 22,
  host: CONFIG.appenv.storage.scp.ip,
  username: CONFIG.appenv.storage.scp.user,
  password: CONFIG.appenv.storage.scp.password
})


//var u_id_duplicate = false
var u_id_duplicate_times = 0
var code_num = 4 // 資料庫裡 u_id 的位數
var have_the_same_u_id = function(u_id, data_for_have_the_same_u_id, cb){
  fileModel.getOne('u_id', u_id, function(results_check){
    if(results_check.length == 1){
      u_id_duplicate_times += 1
      if(u_id_duplicate_times >= 3){ // 重覆跑超過三次之後，將位數增加
        code_num += 1
      }
      var unique_id = functions.generate_random_code(code_num)
      have_the_same_u_id(unique_id, data_for_have_the_same_u_id, function(){
        duplicate_func(data_for_have_the_same_u_id.req, data_for_have_the_same_u_id.res, data_for_have_the_same_u_id.fields, data_for_have_the_same_u_id.data_files, data_for_have_the_same_u_id.original_filename, unique_id, data_for_have_the_same_u_id.saved_obj)
      })
    }else{
      cb()
    }

  })
}

var duplicate_func = function(req, res, fields, data_files, original_filename, unique_id, saved_obj){

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
        original_filename: original_filename,
        files: data_files
      }
    })

  })

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

var save_file_related_data = function(req, res, results){
  // parse a file upload
  var form = new formidable.IncomingForm()
  form.encoding = 'utf-8'
  form.keepExtensions = true
  //form.maxFieldsSize = 10 * 1024 * 1024  // 10MB

  form.parse(req, function(err, fields, files) {

    var file_ext = (files.upload.name.split('.').pop()).toLowerCase()  // 副檔名
    var original_filename = files.upload.name; // 原檔名

    if( file_ext == "jpeg" || file_ext == "jpg" || file_ext == "png" || file_ext == "gif" ){
      var file_type_num = 1
      if(file_ext == 'gif'){ // 因為 Staging 目前使用 Jimp，不支援 gif
        return res.status(403).json({ code: 403, error: { message: 'Staging 不支援 gif 圖檔！', original_filename: original_filename } })
      }
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
        var random_for_new_file = functions.generate_random_code(4)
        var file_new_name = results[0].user_id + '_' + current_timestamp + '_' + random_for_new_file + '_original' + '.' + file_ext  // 完整檔案名稱(含副檔名)
        var generated_filename = [
          results[0].user_id + '_' + current_timestamp + '_' + random_for_new_file + '_320.' + file_ext,
          results[0].user_id + '_' + current_timestamp + '_' + random_for_new_file + '_640.' + file_ext,
          results[0].user_id + '_' + current_timestamp + '_' + random_for_new_file + '_960.' + file_ext
        ]

        fs.rename(files.upload.path, form.uploadDir + "/" + file_new_name, function(){

          settingModel.getOne('option_name', 'upload_filesize_limit', function(result){

            // result[0].option_value就是後台設定的最大 KB 數，乘上1024轉成多少個 bytes
            if(files.upload.size > (parseInt(result[0].option_value) * 1024)){ // files.upload.size: 873241byte，後台可設定最大上傳多少K，這裡佔定 10M = 10 * 1024 * 1024
              // 將原本機端的檔案刪除
              fs.unlink(form.uploadDir + '/' + file_new_name, (err) => {
                if (err) throw err
                // 回傳圖片路徑
                res.status(403).json({ code: 403, error: { 'message': '檔案過大，無法上傳！', original_filename: original_filename } })
              })
            }else{
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
                  var saved_origin_data = JSON.parse(JSON.stringify(json_origin_data))

                  saved_origin_data.url = CONFIG.appenv.storage.path + '/' + api_upload_dir + '/' + fields.category + '/' + file_new_name
                  json_origin_data.url = CONFIG.appenv.storage.domain + CONFIG.appenv.storage.path + '/' + api_upload_dir + '/' + fields.category + '/' + file_new_name

                  data_files.push(json_origin_data)
                  data_files_save.push(saved_origin_data)

                  // 重這開始
                  generated_filename.forEach(function(item, index, arr) {
                    var split_item = item.split('_')
                    var setting_width = ((split_item[3]).split('.'))[0] // 寬度

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

                            var saved_obj = {
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

                            var data_for_have_the_same_u_id = {
                              req: req,
                              res: res,
                              fields: fields,
                              data_files: data_files,
                              original_filename: original_filename,
                              saved_obj: saved_obj
                            }
                            if(CONFIG.appenv.env == 'local'){ // local 端直接儲存
                              var unique_id = functions.generate_random_code(code_num)
                              have_the_same_u_id(unique_id, data_for_have_the_same_u_id, function(){
                                duplicate_func(req, res, fields, data_files, original_filename, unique_id, saved_obj)
                              })
                            }else{
                              scp_to_storage(form.uploadDir, fields.category, api_upload_dir, file_new_name, generated_filename, data_for_have_the_same_u_id)
                            }

                            /*
                            var unique_id = functions.generate_random_code(code_num)
                            have_the_same_u_id(unique_id, function(){
                              duplicate_func(req, res, fields, data_files, original_filename, unique_id, saved_obj)
                            })

                            if(CONFIG.appenv.env != 'local'){
                              scp_to_storage(form.uploadDir, fields.category, api_upload_dir, file_new_name, generated_filename)
                            }
                            */

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
        var file_new_name = results[0].user_id + '_' + current_timestamp + '_' + functions.generate_random_code(4) + '_original' + '.' + file_ext  // 完整檔案名稱(含副檔名)

        fs.rename(files.upload.path, form.uploadDir + "/" + file_new_name, function(){

          settingModel.getOne('option_name', 'upload_filesize_limit', function(result){

            // result[0].option_value就是後台設定的最大 KB 數，乘上1024轉成多少個 bytes
            if(files.upload.size > (parseInt(result[0].option_value) * 1024)){ // files.upload.size: 873241byte，後台可設定最大上傳多少K，這裡佔定 10M = 10 * 1024 * 1024
              // 將原本機端的檔案刪除
              fs.unlink(form.uploadDir + '/' + file_new_name, (err) => {
                if (err) throw err
                // 回傳圖片路徑
                res.status(403).json({ code: 403, error: { 'message': '檔案過大，無法上傳！', original_filename: original_filename } })
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

                  var saved_obj = {
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

                  var data_for_have_the_same_u_id = {
                    req: req,
                    res: res,
                    fields: fields,
                    data_files: data_files,
                    original_filename: original_filename,
                    saved_obj: saved_obj
                  }
                  if(CONFIG.appenv.env == 'local'){ // local 端直接儲存
                    var unique_id = functions.generate_random_code(code_num)
                    have_the_same_u_id(unique_id, data_for_have_the_same_u_id, function(){
                      duplicate_func(req, res, fields, data_files, original_filename, unique_id, saved_obj)
                    })
                  }else{
                    var generated_filename = []
                    scp_to_storage(form.uploadDir, fields.category, api_upload_dir, file_new_name, generated_filename, data_for_have_the_same_u_id)
                  }


                  /*
                  var unique_id = functions.generate_random_code(code_num)
                  have_the_same_u_id(unique_id, function(){
                    duplicate_func(req, res, fields, data_files, original_filename, unique_id, saved_obj)
                  })

                  if(CONFIG.appenv.env != 'local'){
                    scp_to_storage(form.uploadDir, fields.category, api_upload_dir, file_new_name, generated_filename)
                  }
                  */

                })



              //}
            }
          })

        })
        break;
      default:
        res.status(403).json({ code: 403, error: { 'message': '檔案類型不支援！(非圖片限 PDF)', original_filename: original_filename } })
    }

  })
}

var scp_to_storage = function(form_uploadDir, fields_category, api_upload_dir, file_new_name, generated_filename, data_for_have_the_same_u_id){
  client_scp2.mkdir(CONFIG.appenv.storage.storage_uploads_path + '/' + api_upload_dir, function(err){
    client_scp2.mkdir(CONFIG.appenv.storage.storage_uploads_path + '/' + api_upload_dir + '/' + fields_category, function(err){

      // 傳原圖至 Storage
      client_scp2.upload(form_uploadDir + '/' + file_new_name, CONFIG.appenv.storage.storage_uploads_path + '/' + api_upload_dir + '/' + fields_category + '/' + file_new_name, function(){

        // 將原本機端的原檔案刪除
        fs.unlink(form_uploadDir + '/' + file_new_name, (err) => {
          if (err) throw err
        })

        // 傳縮圖至 Storage，然後刪除
        if(generated_filename.length > 0){
          generated_filename.forEach(function(generated_item, generated_index, generated_arr) {
            client_scp2.upload(form_uploadDir + '/' + generated_item, CONFIG.appenv.storage.storage_uploads_path + '/' + api_upload_dir + '/' + fields_category + '/' + generated_item, function(){
              fs.unlink(form_uploadDir + '/' + generated_item, (err) => {
                if (err) throw err

                if(generated_index + 1 == generated_filename.length){
                  var unique_id = functions.generate_random_code(code_num)
                  have_the_same_u_id(unique_id, data_for_have_the_same_u_id, function(){
                    duplicate_func(data_for_have_the_same_u_id.req, data_for_have_the_same_u_id.res, data_for_have_the_same_u_id.fields, data_for_have_the_same_u_id.data_files, data_for_have_the_same_u_id.original_filename, unique_id, data_for_have_the_same_u_id.saved_obj)
                  })
                }

              })
            })
          })
        }else{
          var unique_id = functions.generate_random_code(code_num)
          have_the_same_u_id(unique_id, data_for_have_the_same_u_id, function(){
            duplicate_func(data_for_have_the_same_u_id.req, data_for_have_the_same_u_id.res, data_for_have_the_same_u_id.fields, data_for_have_the_same_u_id.data_files, data_for_have_the_same_u_id.original_filename, unique_id, data_for_have_the_same_u_id.saved_obj)
          })
        }

      })
    })
  })
}

exports.image_get = function(options){
  return function(req, res){
    if(req.query.api_key == undefined){
      return res.status(403).json({code: 403, msg:'未提供 API Key'})
    }
    apiKeyModel.getOne('api_key', req.query.api_key, function(results){
      if(results.length > 0 || req.query.api_key == CONFIG.appenv.full_api_key){

        // 若是 full_api_key 的話，不需要將 request_times 加 1
        if(req.query.api_key != CONFIG.appenv.full_api_key){
          if(results.length > 0){
            // 將此 api_key 的 request_times 次數加 1
            apiKeyModel.update({'request_times': results[0].request_times + 1}, {'api_key': req.query.api_key}, true, function(){})
          }
        }

        var sort_obj = { column: "created_at", sort_type: "DESC" }
        var where_obj = { column_name: "deleted_at", operator: "", column_value: 'IS NULL' }
        var prepare_data = []

        organizationModel.getAll({column: 'id', sort_type: 'DESC'}, function(all_organs){
          //console.log(all_organs)
          userModel.getAll({column: 'id', sort_type: 'DESC'}, function(all_users){
            //console.log(all_users)
            fileCategoryModel.getAll({column: 'id', sort_type: 'DESC'}, function(all_categories){
              //console.log(all_categories)
              tagModel.getAll({column: 'id', sort_type: 'DESC'}, function(all_tags){
                //console.log(all_tags)

                fileModel.getOne('u_id', req.params.u_id, function(files){
                  if(files.length == 0){
                    res.status(404).json({ code: 404, error: { 'message': '找不到該檔案'} })
                  }else{

                    // 若該 api_key 的使用者 與 圖片的使用者一致的話，不論 permissions 為何，都可回傳；或者 圖片的 permissions 為 '1' 的話，也可回傳；或者使用 full_api_key 也可回傳
                    if( req.query.api_key == CONFIG.appenv.full_api_key || results[0].user_id == files[0].user_id || files[0].permissions == '1'){
                      // 找出該檔案之 tags
                      fileTagModel.getAllWhere({column: 'id', sort_type: 'DESC'}, { column_name: 'file_id', operator: '=', column_value: files[0].id }, function(tags_result){

                        var file_tags_arr = []
                        all_tags.forEach(function(the_tag, tag_index){
                          tags_result.forEach(function(tags_result_item, tags_result_index){
                            if(the_tag.id == tags_result_item.tag_id){
                              file_tags_arr.push(the_tag.tag_name)
                            }
                          })
                        })
                        // tags 字串，以逗號分隔
                        var file_tags_str = file_tags_arr.join()

                        // 找出所屬組織名稱
                        all_organs.forEach(function(the_organ, organ_index){
                          if(files[0].organ_id == the_organ.organ_id){
                            files[0].organ_name = the_organ.organ_name
                            //prepare_data.push(item)
                          }
                        })
                        // 找出使用者名稱
                        all_users.forEach(function(the_user, user_index){
                          if(files[0].user_id == the_user.id){
                            files[0].pid = the_user.pid
                            //prepare_data.push(item)
                          }
                        })
                        // 找出分類名稱
                        all_categories.forEach(function(the_category, category_index){
                          if(files[0].category_id == the_category.id){
                            files[0].category_name = the_category.category_name
                            //prepare_data.push(item)
                          }
                        })

                        // 將 url 前面加上 storage domain
                        var new_file_data = JSON.parse(files[0].file_data)
                        new_file_data.forEach(function(file_data_item, file_data_index){
                          new_file_data[file_data_index].url = CONFIG.appenv.storage.domain + file_data_item.url
                        })

                        // 資料回傳重組
                        var file_data = [{
                          u_id: files[0].u_id,
                          short_url: CONFIG.appenv.domain + '/f/' + files[0].u_id,
                          title: files[0].title,
                          file_ext: files[0].file_ext,
                          pageviews: files[0].pageviews,
                          organ_name: files[0].organ_name,
                          pid: files[0].pid,
                          category_name: files[0].category_name,
                          file_data: new_file_data,
                          tags: file_tags_str,
                          created_at: files[0].created_at,
                          updated_at: files[0].updated_at
                        }]

                        res.status(200).json({ code: 200, data: { files: file_data} })

                      })
                    }else{
                      res.status(403).json({ code: 403, error: { 'message': '無權取得該檔案資料'} })
                    }

                  }
                })

              })

            })
          })
        })


      }else{
        return res.status(403).json({code: 403, msg:'未經授權的 API Key'})
      }
    })


  }
}

exports.image_post = function(options){

  return function(req, res){

    if(req.query.api_key == CONFIG.appenv.full_api_key && !req.session.u_id){
      return res.status(403).json({code: 403, msg:'使用了特殊 API Key，但尚未登入！'})
    }

    if(req.query.api_key == undefined){
      res.status(403).json({code: 403, msg:'未提供 API Key'})
    }else{

      apiKeyModel.getOne('api_key', req.query.api_key, function(results){
        if(results.length > 0 || req.query.api_key == CONFIG.appenv.full_api_key){

          // 若是 full_api_key 的話，不需要將 request_times 加 1
          if(req.query.api_key != CONFIG.appenv.full_api_key){
            if(results.length > 0){
              // 將此 api_key 的 request_times 次數加 1
              apiKeyModel.update({'request_times': results[0].request_times + 1}, {'api_key': req.query.api_key}, true, function(){})
            }
          }

          if(req.query.api_key == CONFIG.appenv.full_api_key && req.session.u_id){
            userModel.getOne('u_id', req.session.u_id, function(user_results){
              user_results.forEach(function(user_item, user_index){
                user_results[user_index].user_id = user_item.id
              })
              save_file_related_data(req, res, user_results)
            })
          }else{
            save_file_related_data(req, res, results)
          }

        }else{
          res.status(403).json({code: 403, msg:'未經授權的 API Key'})
        }
      })


    }

  }
}

// 將檔案標記為刪除：軟刪除
exports.image_soft_delete = function(options){
  return function(req, res){
    if(req.query.api_key == undefined){
      return res.status(403).json({code: 403, msg:'未提供 API Key'})
    }
    apiKeyModel.getOne('api_key', req.query.api_key, function(results){
      if(results.length > 0 || req.query.api_key == CONFIG.appenv.full_api_key){

        // 若是 full_api_key 的話，不需要將 request_times 加 1
        if(req.query.api_key != CONFIG.appenv.full_api_key){
          if(results.length > 0){
            // 將此 api_key 的 request_times 次數加 1
            apiKeyModel.update({'request_times': results[0].request_times + 1}, {'api_key': req.query.api_key}, true, function(){})
          }
        }


        fileModel.getOne('u_id', req.params.u_id, function(files){
          if(files.length == 0){
            return res.status(404).json({ code: 404, error: { 'message': '找不到該檔案'} })
          }else{

            // 若該 api_key 的使用者 與 圖片的使用者一致的話，不論 permissions 為何，都可回傳；或者使用 full_api_key 也可回傳
            if( req.query.api_key == CONFIG.appenv.full_api_key || results[0].user_id == files[0].user_id ){

              if(files[0].deleted_at == null){
                var time_now = parseInt(Date.now() / 1000)
                var update_obj = { deleted_at: time_now }
                var where_obj = { u_id: req.params.u_id }
                fileModel.update(update_obj, where_obj, false, function(delete_results){
                  return res.status(200).json({ code: 200, data: { u_id : req.params.u_id, deleted_at: time_now } })
                })
              }else{
                return res.status(403).json({ code: 403, error: { u_id : req.params.u_id, message: '先前已刪除過' } })
              }


            }else{
              res.status(403).json({ code: 403, error: { 'message': '無權更新該檔案資料'} })
            }

          }
        })

      }else{
        return res.status(403).json({code: 403, msg:'未經授權的 API Key'})
      }
    })


  }
}

// 將檔案標記為刪除：軟刪除復原
exports.image_soft_delete_undo = function(options){
  return function(req, res){
    //console.log(req.get('host'))

    if(req.query.api_key == undefined){
      return res.status(403).json({code: 403, msg:'未提供 API Key'})
    }
    apiKeyModel.getOne('api_key', req.query.api_key, function(results){
      if(results.length > 0 || req.query.api_key == CONFIG.appenv.full_api_key){

        // 若是 full_api_key 的話，不需要將 request_times 加 1
        if(req.query.api_key != CONFIG.appenv.full_api_key){
          if(results.length > 0){
            // 將此 api_key 的 request_times 次數加 1
            apiKeyModel.update({'request_times': results[0].request_times + 1}, {'api_key': req.query.api_key}, true, function(){})
          }
        }


        fileModel.getOne('u_id', req.params.u_id, function(files){
          if(files.length == 0){
            return res.status(404).json({ code: 404, error: { 'message': '找不到該檔案'} })
          }else{

            // 若該 api_key 的使用者 與 圖片的使用者一致的話，不論 permissions 為何，都可回傳；或者使用 full_api_key 也可回傳
            if( req.query.api_key == CONFIG.appenv.full_api_key || results[0].user_id == files[0].user_id ){

              if(files[0].deleted_at == null){
                return res.status(403).json({ code: 403, error: { u_id : req.params.u_id, message: '此檔案過去未被丟至垃圾桶' } })
              }else{
                var update_obj = { deleted_at: null }
                var where_obj = { u_id: req.params.u_id }
                fileModel.update(update_obj, where_obj, false, function(delete_results){
                  return res.status(200).json({ code: 200, data: { u_id : req.params.u_id, message: '已復原' } })
                })
              }


            }else{
              res.status(403).json({ code: 403, error: { 'message': '無權更新該檔案資料'} })
            }

          }
        })

      }else{
        return res.status(403).json({code: 403, msg:'未經授權的 API Key'})
      }
    })


  }
}

// 將檔案刪除
exports.image_hard_delete = function(options){
  return function(req, res){
    if(req.query.api_key == undefined){
      return res.status(403).json({code: 403, msg:'未提供 API Key'})
    }
    apiKeyModel.getOne('api_key', req.query.api_key, function(results){
      if(results.length > 0 || req.query.api_key == CONFIG.appenv.full_api_key){

        // 若是 full_api_key 的話，不需要將 request_times 加 1
        if(req.query.api_key != CONFIG.appenv.full_api_key){
          if(results.length > 0){
            // 將此 api_key 的 request_times 次數加 1
            apiKeyModel.update({'request_times': results[0].request_times + 1}, {'api_key': req.query.api_key}, true, function(){})
          }
        }

        fileModel.getOne('u_id', req.params.u_id, function(files){
          if(files.length == 0){
            return res.status(404).json({ code: 404, error: { 'message': '找不到該檔案'} })
          }else{

            // 若該 api_key 的使用者 與 圖片的使用者一致的話，不論 permissions 為何，都可回傳；或者使用 full_api_key 也可回傳
            if( req.query.api_key == CONFIG.appenv.full_api_key || results[0].user_id == files[0].user_id ){

              // step 1: 刪除 資料表 files_tags
              fileTagModel.deleteWhere('file_id', files[0].id, function(del_tag_result){

                // step 2: 刪除 資料表 file_like
                fileLikeModel.deleteWhere('file_id', files[0].id, function(del_like_result){

                  // step 3: 刪除 資料表 file_carousel
                  fileCarouselModel.deleteWhere('file_id', files[0].id, function(del_like_result){

                    // step 4: 刪除 實際檔案
                    if(CONFIG.appenv.env == 'local'){

                      JSON.parse(files[0].file_data).forEach(function(file_item, file_index){

                        // 取得欲刪除的檔案路徑
                        var file_path_split = files[0].file_path.split('/')
                        file_path_split.splice(0, 1)
                        var dir_path = file_path_split[0].split('_')
                        file_path_split.splice(0, 1)
                        var unlink_path = dir_path.join('/') + '/' + file_path_split.join('/')

                        var will_del_file_name = file_item.url.split('/').pop()  // 檔名

                        var delete_file_path = CONFIG.path.project + '/' + unlink_path + '/' + will_del_file_name
                        if (fs.existsSync(delete_file_path)) {
                          fs.unlinkSync(delete_file_path)
                        }
                        if( (JSON.parse(files[0].file_data)).length == (file_index + 1)){
                          // step 5: 刪除 資料表 files
                          fileModel.deleteWhere('id', files[0].id, function(){
                            return res.status(200).json({code: 200, msg:'刪除成功'})
                          })
                        }

                      })

                    }else{ // 非 local 端，刪除遠端路徑
                      JSON.parse(files[0].file_data).forEach(function(file_item, file_index){

                        // 取得欲刪除的檔案路徑
                        var file_path_split = files[0].file_path.split('/')
                        file_path_split.splice(0, 1)
                        var dir_path = file_path_split[0].split('_')
                        file_path_split.splice(0, 1)
                        var unlink_path = dir_path.join('/') + '/' + file_path_split.join('/')

                        var will_del_file_name = file_item.url.split('/').pop()  // 檔名

                        var delete_file_path = CONFIG.path.project + '/' + unlink_path + '/' + will_del_file_name

                        //client_scp2: here
                        client_ssh_sftp.connect({
                            host: CONFIG.appenv.storage.scp.ip,
                            port: 22,
                            username: CONFIG.appenv.storage.scp.user,
                            password: CONFIG.appenv.storage.scp.password
                        }).then(() => {
                          console.log(delete_file_path)
                          client_ssh_sftp.delete(delete_file_path);
                          if( (JSON.parse(files[0].file_data)).length == (file_index + 1)){
                            // step 5: 刪除 資料表 files
                            fileModel.deleteWhere('id', files[0].id, function(){
                              return res.status(200).json({code: 200, msg:'刪除成功'})
                            })
                          }
                        }).catch((err) => {
                          console.log(err, 'catch error');
                        });



                      })
                    }


                  })

                })

              })

            }else{
              res.status(403).json({ code: 403, error: { 'message': '無權更新該檔案資料'} })
            }

          }
        })

      }else{
        return res.status(403).json({code: 403, msg:'未經授權的 API Key'})
      }
    })


  }
}
