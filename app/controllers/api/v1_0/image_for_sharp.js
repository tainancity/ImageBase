var formidable = require('formidable')
var fs = require('graceful-fs')
const async = require("async");
const sharp = require('sharp')
sharp.cache(false)

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
var fileTransferModel = require(CONFIG.path.models + '/file_transfer.js')

//var redisFileDataModel = require(CONFIG.path.redis + '/redis_file_data.js')

var functions = require(CONFIG.path.helpers + '/functions.js')
var static = require(CONFIG.path.helpers + '/static.js')

var Client = require('scp2').Client
var client_scp2 = new Client({
  port: 22,
  host: CONFIG.appenv.storage.scp.ip,
  username: CONFIG.appenv.storage.scp.user,
  password: CONFIG.appenv.storage.scp.password
})

let client_ssh = require('ssh2-sftp-client')
let client_ssh_sftp = new client_ssh()

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
        duplicate_func(data_for_have_the_same_u_id.req, data_for_have_the_same_u_id.res, data_for_have_the_same_u_id.fields, data_for_have_the_same_u_id.data_files, data_for_have_the_same_u_id.original_filename, data_for_have_the_same_u_id.unique_id, data_for_have_the_same_u_id.saved_obj)
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
    /*
    redisFileDataModel.import_to_redis_for_post_temp(function(){
      //CONFIG.appenv.storage.domain + CONFIG.appenv.storage.path + '/' + basic_upload_dir + '/' + fields.category + '/' + file_new_name
      res.status(200).json({
        code: 200,
        data:{
          short_url: CONFIG.appenv.domain + '/' + unique_id,
          short_id: unique_id,
          original_filename: original_filename,
          files: data_files
        }
      })
    })
    */
    res.status(200).json({
      code: 200,
      data:{
        short_url: CONFIG.appenv.domain + '/' + unique_id,
        short_id: unique_id,
        original_filename: original_filename,
        files: data_files
      }
    })


  })
}

// save tags
var save_tags = function(tags_str, fileid){

  var tags_array = tags_str.split(',')

  // 刪除 tag
  var prepare_del_sort_obj = { column: 'id', sort_type: 'DESC' }
  var prepare_del_where_obj = { column_name: 'file_id', operator: '=', column_value: fileid }
  fileTagModel.getAllWhere(prepare_del_sort_obj, prepare_del_where_obj, function(all_file_tags_result){
    if(all_file_tags_result.length > 0){
      all_file_tags_result.forEach(function(prepare_del_tag_item, prepare_del_tag_index){
        tagModel.getOne("id", prepare_del_tag_item.tag_id, function(the_tag_result){
          if(!tags_array.includes(the_tag_result[0].tag_name)){
            fileTagModel.delete2Where('file_id', fileid, 'tag_id', prepare_del_tag_item.tag_id, function(del_result){})
          }
        })
      })
    }
  })

  tags_array.forEach(function(tag_item, tag_index, tag_arr){
    if(tag_item != ''){
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
    }
  })
}

var save_file_related_data = function(req, res, results){
  console.log("1、進到 save_file_related_data 函式");
  // parse a file upload
  var form = new formidable.IncomingForm()
  form.encoding = 'utf-8'
  form.keepExtensions = true
  //form.maxFieldsSize = 10 * 1024 * 1024  // 10MB

  form.parse(req, function(err, fields, files) {
    console.log("2、進到 form.parse");
    var file_ext = (files.upload.name.split('.').pop()).toLowerCase()  // 副檔名
    var original_filename = files.upload.name; // 原檔名

    if( file_ext == "jpeg" || file_ext == "jpg" || file_ext == "png" || file_ext == "gif" ){
      var file_type_num = 1
    }

    switch(file_type_num) {
      case 1:
        console.log("3、進到 switch");
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
          //results[0].user_id + '_' + current_timestamp + '_' + random_for_new_file + '_640.' + file_ext,
          results[0].user_id + '_' + current_timestamp + '_' + random_for_new_file + '_960.' + file_ext
        ]
        console.log("4、執行更名前");
        fs.rename(files.upload.path, form.uploadDir + "/" + file_new_name, function(){

          settingModel.getOne('option_name', 'upload_filesize_limit', function(result){
            console.log("5、取得 setting 資料中的 upload_filesize_limit");
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
              console.log("6、取得路徑。");
              try{
                console.log("7、進到 try。")
                sharp(form.uploadDir + '/' + file_new_name)
                  .rotate()
                  .toFile(form.uploadDir + '/' + 'temp_' + file_new_name, function(err_origin, info_origin){
                    console.log("8、進到第一個 sharp");
                    if (err_origin) throw err_origin
                    var json_origin_data = {
                      format: info_origin.format,
                      width: info_origin.width,
                      height: info_origin.height,
                      size: info_origin.size,
                      origin: true
                    }
                    var saved_origin_data = JSON.parse(JSON.stringify(json_origin_data));

                    saved_origin_data.url = CONFIG.appenv.storage.path + '/' + api_upload_dir + '/' + fields.category + '/' + file_new_name
                    json_origin_data.url = CONFIG.appenv.storage.domain + CONFIG.appenv.storage.path + '/' + api_upload_dir + '/' + fields.category + '/' + file_new_name

                    data_files.push(json_origin_data)
                    data_files_save.push(saved_origin_data)
                    console.log("9、將原本未 rotate 的移除");
                    // 將原本未 rotate 的移除
                    fs.unlink(form.uploadDir + '/' + file_new_name, (err) => {
                      if (err) throw err
                      fs.rename(form.uploadDir + '/' + 'temp_' + file_new_name, form.uploadDir + '/' + file_new_name, function(){


                        // 重這開始：第 1
                        var split_item = (generated_filename[0]).split('_')
                        var setting_width = ((split_item[3]).split('.'))[0] // 寬度: 320
                        sharp(form.uploadDir + "/" + file_new_name)
                          //.rotate()
                          //.extract({ left: 0, top: 0, width: info_origin.width, height: info_origin.height })
                          .resize(parseInt(setting_width), null)
                          .toFile(form.uploadDir + '/' + generated_filename[0], function(err, info0){
                            if (err) throw err
                            console.log("10、進到第二個 sharp。");
                            //console.log(info)
                            //{ format: 'jpeg',
                            //  width: 960,
                            //  height: 720,
                            //  channels: 3,
                            //  premultiplied: false,
                            //  size: 65616 }
                            var json_data = {
                              format: info0.format,
                              width: info0.width,
                              height: info0.height,
                              size: info0.size,
                              origin: false
                            }
                            var saved_data = JSON.parse(JSON.stringify(json_data));

                            saved_data.url = CONFIG.appenv.storage.path + '/' + api_upload_dir + '/' + fields.category + '/' + generated_filename[0]
                            json_data.url = CONFIG.appenv.storage.domain + CONFIG.appenv.storage.path + '/' + api_upload_dir + '/' + fields.category + '/' + generated_filename[0]

                            data_files_save.push(saved_data)
                            data_files.push(json_data)


                            // 第 2
                            var split_item = (generated_filename[1]).split('_')
                            var setting_width = ((split_item[3]).split('.'))[0] // 寬度: 960
                            sharp(form.uploadDir + "/" + file_new_name)
                              //.rotate()
                              //.extract({ left: 0, top: 0, width: info_origin.width, height: info_origin.height })
                              .resize(parseInt(setting_width), null)
                              .toFile(form.uploadDir + '/' + generated_filename[1], function(err, info1){
                                if (err) throw err
                                console.log("11、進到第三個 sharp。");
                                //console.log(info)
                                //{ format: 'jpeg',
                                //  width: 960,
                                //  height: 720,
                                //  channels: 3,
                                //  premultiplied: false,
                                //  size: 65616 }
                                var json_data = {
                                  format: info1.format,
                                  width: info1.width,
                                  height: info1.height,
                                  size: info1.size,
                                  origin: false
                                }
                                var saved_data = JSON.parse(JSON.stringify(json_data));

                                saved_data.url = CONFIG.appenv.storage.path + '/' + api_upload_dir + '/' + fields.category + '/' + generated_filename[1]
                                json_data.url = CONFIG.appenv.storage.domain + CONFIG.appenv.storage.path + '/' + api_upload_dir + '/' + fields.category + '/' + generated_filename[1]

                                data_files_save.push(saved_data)
                                data_files.push(json_data)

                                // 儲存
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
                                  if(CONFIG.appenv.env == 'local' || CONFIG.appenv.env == 'staging'){ // local 端直接儲存
                                    console.log("12、這是本機端或 staing\n");
                                    var unique_id = functions.generate_random_code(code_num)
                                    have_the_same_u_id(unique_id, data_for_have_the_same_u_id, function(){
                                      duplicate_func(req, res, fields, data_files, original_filename, unique_id, saved_obj)
                                    })
                                  }else{
                                    console.log("12、傳到 storage 伺服器\n");
                                    scp_to_storage(form.uploadDir, fields.category, api_upload_dir, file_new_name, generated_filename, data_for_have_the_same_u_id)
                                  }


                                })

                              })
                          })


                      })
                    })

                  })
                  //console.log("執行到這裡");
              }catch(err){
                console.log(err);
                res.status(500).json({ code: 500, error: { 'message': '執行失敗！', original_filename: original_filename }, err_obj: err })
              }


            }
          })

        })
        break;
      default:
        res.status(403).json({ code: 403, error: { 'message': '檔案類型不支援！', original_filename: original_filename } })
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


// 為每個檔案加上按讚數
var file_add_like = function(files_arr, files_like_arr){
  files_arr.forEach(function(file_item, file_index){
    files_arr[file_index].like_num = 0
    files_like_arr.forEach(function(like_item, like_index){
      if(file_item.id == like_item.file_id){
        files_arr[file_index].like_num = like_item.file_id_total
      }
    })
  });
  return files_arr;
};
// 排序
var files_sort = function(files_arr, sort_value){
  files_arr.sort(function(a, b){
    var comparison = 0
    if(sort_value == 'DESC'){
      if(a.like_num > b.like_num){
        comparison = -1
      }else{
        comparison = 1
      }
    }
    if(sort_value == 'ASC'){
      if(a.like_num > b.like_num){
        comparison = 1
      }else{
        comparison = -1
      }
    }
    return comparison
  });
  return files_arr;
};


exports.image_get = function(options){
  return function(req, res){
    if(req.query.api_key == undefined){
      return res.status(403).json({code: 403, msg:'未提供 API Key'})
    }
    apiKeyModel.getOne('api_key', req.query.api_key, function(results){
      if(results.length > 0 || req.query.api_key == CONFIG.appenv.full_api_key){

        if(req.query.api_key == CONFIG.appenv.full_api_key){ // 若是使用特殊的 api key，限只能站內使用
          if( ! (req.header('Referer')).includes(CONFIG.appenv.domain) ){
            return res.status(403).json({code: 403, msg:'無效存取！'})
          }
        }

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
                          short_url: CONFIG.appenv.domain + '/' + files[0].u_id,
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

exports.image_get_by_data = function(options){
  return function(req, res){
    //console.log("哈囉哈囉");
    if(req.query.api_key == undefined){
      return res.status(403).json({code: 403, msg:'未提供 API Key'})
    }
    apiKeyModel.getOne('api_key', req.query.api_key, function(results){
      if(results.length > 0 || req.query.api_key == CONFIG.appenv.full_api_key){

        if(req.query.api_key == CONFIG.appenv.full_api_key){ // 若是使用特殊的 api key，限只能站內使用
          if( req.header('Referer') == undefined || ( ! (req.header('Referer')).includes(CONFIG.appenv.domain) ) ){
            return res.status(403).json({code: 403, msg:'無效存取！'})
          }
        }

        // 若是 full_api_key 的話，不需要將 request_times 加 1
        if(req.query.api_key != CONFIG.appenv.full_api_key){
          if(results.length > 0){
            // 將此 api_key 的 request_times 次數加 1
            apiKeyModel.update({'request_times': results[0].request_times + 1}, {'api_key': req.query.api_key}, true, function(){})
          }
        }

        //req.query.title
        organizationModel.getAll({column: 'id', sort_type: 'DESC'}, function(all_organs){
          //console.log(all_organs)
          userModel.getAll({column: 'id', sort_type: 'DESC'}, function(all_users){
            //console.log(all_users)
            fileCategoryModel.getAll({column: 'id', sort_type: 'DESC'}, function(all_categories){
              //console.log(all_categories)

              //tagModel.getAll({column: 'id', sort_type: 'DESC'}, function(all_tags){
              tagModel.getAllWhere({column: 'id', sort_type: 'DESC'}, {column_name: 'tag_name', operator: 'LIKE', column_value: "'%" + req.query.title + "%'"}, function(all_tags){
                //console.log("符合的tags");
                //console.log(all_tags);
                let all_tags_string = ""; // 將 tag_id 用逗號做分隔
                if(all_tags.length > 0){
                  all_tags.forEach(function(tag_item, tag_index){
                    if(tag_index == 0){
                      all_tags_string += tag_item.id
                    }else{
                      all_tags_string += "," + tag_item.id
                    }
                  })
                }
                //console.log(all_tags_string);
                let file_tag_model_bool = true;
                if(all_tags_string == ""){
                }else{
                  file_tag_model_bool = false;
                }

                //fileTagModel.getAll({column: 'id', sort_type: 'DESC'}, function(all_file_tags){
                fileTagModel.getAllWhereSkip({column: 'id', sort_type: 'DESC'}, {column_name: 'tag_id', operator: 'IN', column_value: "(" + all_tags_string + ")"}, file_tag_model_bool, function(all_file_tags){
                  //console.log("file 符合的tags");
                  //console.log(all_file_tags);

                  let all_file_withtag_string = ""; // 將 tag_id 用逗號做分隔
                  if(all_file_tags.length > 0){
                    all_file_tags.forEach(function(file_tag_item, file_tag_index){
                      if(file_tag_index == 0){
                        all_file_withtag_string += file_tag_item.file_id
                      }else{
                        all_file_withtag_string += "," + file_tag_item.file_id
                      }
                    })
                  }
                  // 將符合 tag 的 file ，抓出來
                  //console.log("符合 tag 的 file：");
                  //console.log(all_file_withtag_string);

                  var sort_type = ''
                  if(req.query.sort_type == undefined || req.query.sort_type == 'like'){
                    sort_type = 'created_at'
                  }else{
                    sort_type = req.query.sort_type
                  }
                  if(req.query.sort_value == undefined){
                    req.query.sort_value = 'DESC'
                  }

                  // req.query.items_per_page、req.query.page、req.query.title、req.query.category_id、req.query.organ_id
                  //console.log("分類id" + req.query.category_id);
                  //console.log("組織id" + req.query.organ_id);

                  let where_array = [
                    { column_name: 'permissions', operator: '=', column_value: '1' },
                    { column_name: 'deleted_at', operator: '', column_value: 'IS NULL' }
                  ];
                  if(req.query.category_id != undefined){
                    where_array.push({ column_name: 'category_id', operator: '=', column_value: req.query.category_id})
                  }
                  if(req.query.organ_id != undefined){
                    where_array.push({ column_name: 'organ_id', operator: '=', column_value: "'" + req.query.organ_id + "'"})
                  }

                  let or_array = [];
                  if(req.query.title != undefined){
                    or_array.push({ column_name: 'title', operator: 'LIKE', column_value: "'%" + req.query.title + "%'" });
                  }
                  if(all_file_withtag_string != ""){ // 這表示的是輸入的關鍵字，有對應到 tag，然後 file 有該 tag 的抓出來，這邊會是 file_id，然後逗號分隔
                    or_array.push({ column_name: 'id', operator: 'IN', column_value: "(" + all_file_withtag_string + ")"})
                  }

                  //fileModel.getAll2Where({ column: sort_type, sort_type: req.query.sort_value }, { column_name: 'permissions', operator: '=', column_value: '1' }, { column_name: 'deleted_at', operator: '', column_value: 'IS NULL' }, function(all_files){
                  fileModel.getAllWhereOrArrayOnlyId({ column: sort_type, sort_type: req.query.sort_value }, where_array, or_array, function(all_files_only_id){
                    //console.log("抓取出的檔案(欄位只抓 id)：")
                    //console.log(all_files_only_id);

                    fileLikeModel.count_column({ name: 'file_id', alias: 'file_id_total', sort_value: req.query.sort_value }, function(files_like){

                      //console.log(all_files_only_id);
                      let match_liks_id = [];
                      if(req.query.sort_type == 'like'){ // 依讚排序

                        // 為每個檔案加上按讚數
                        all_files_only_id = file_add_like(all_files_only_id, files_like);
                        // 排序
                        all_files_only_id = files_sort(all_files_only_id, req.query.sort_value);

                        match_liks_id = all_files_only_id.slice((parseInt(req.query.page) - 1) * parseInt(req.query.items_per_page), (parseInt(req.query.page) - 1) * parseInt(req.query.items_per_page) + parseInt(req.query.items_per_page));
                        match_liks_id = match_liks_id.map((item, index) => item.id);
                      }

                      //console.log(match_liks_id);

                      fileModel.getAllWhereOrArrayLimit({ column: sort_type, sort_type: req.query.sort_value }, where_array, or_array, [(parseInt(req.query.page) - 1) * parseInt(req.query.items_per_page), parseInt(req.query.items_per_page)], { column_name: 'id', operator: 'IN', column_value: match_liks_id }, function(all_files){
                        //console.log("抓取出的檔案：")
                        //console.log(all_files);

                        if(all_files.length == 0){
                          return res.status(404).json({ code: 404, error: { 'message': '找不到該檔案'} })
                        }else{

                          // 為每個檔案加上按讚數
                          all_files = file_add_like(all_files, files_like);

                          if(req.query.sort_type == 'like'){ // 依讚排序
                            // 排序
                            all_files = files_sort(all_files, req.query.sort_value);
                          }

                          //var data_files = []
                          var data_files = all_files.slice();

                          // 替上述的圖片，再找出以下資料
                          data_files.forEach(function(file_item, file_index){
                            // 找出使用者名稱
                            all_users.forEach(function(the_user, user_index){
                              if(file_item.user_id == the_user.id){
                                data_files[file_index].user_name = static.decrypt(the_user.name)
                              }
                            })

                            // 找出分類名稱
                            all_categories.forEach(function(the_category, category_index){
                              if(file_item.category_id == the_category.id){
                                data_files[file_index].category_name = the_category.category_name
                              }
                            })

                            // 找出所屬組織名稱
                            all_organs.forEach(function(the_organ, organ_index){
                              if(file_item.organ_id == the_organ.organ_id){
                                data_files[file_index].organ_name = the_organ.organ_name
                              }
                            })

                            // 將 url 前面加上 storage domain
                            var new_file_data = JSON.parse(file_item.file_data)
                            new_file_data.forEach(function(file_data_item, file_data_index){
                              new_file_data[file_data_index].url = CONFIG.appenv.storage.domain + file_data_item.url
                            })
                            data_files[file_index].file_data = new_file_data

                            // short url
                            data_files[file_index].short_url = CONFIG.appenv.domain + '/' + file_item.u_id
                          })

                          // 瀏覽量(pageviews)的 filter
                          new_data_files = []
                          if(req.query.pageviews == '' || req.query.pageviews == undefined){
                          }else{
                            data_files.forEach(function(file_item, file_index){
                              if(file_item.pageviews >= parseInt(req.query.pageviews)){
                                new_data_files.push(file_item)
                              }
                            })
                            data_files = new_data_files;
                          }

                          // 計算頁碼
                          var items_per_page = (parseInt(req.query.items_per_page) <= 30 ? req.query.items_per_page : 30) // 預設每頁幾筆資料
                          var total_page = Math.ceil(all_files_only_id.length / items_per_page)
                          if(req.query.page == undefined || req.query.page < 1){
                            var current_page = 1
                          }else{
                            var current_page = parseInt(req.query.page)
                          }
                          if(current_page > total_page){
                            return res.status(404).json({ code: 404, error: { 'message': '找不到檔案'} })
                          }

                          if(current_page == 1){
                            var p_page = ''
                            if(total_page == 1){
                              var n_page = ''
                            }else{
                              var n_page = current_page + 1
                            }
                          }else{
                            var p_page = current_page - 1
                            if(current_page == total_page){
                              var n_page = ''
                            }else{
                              var n_page = current_page + 1
                            }
                          }

                          // 複製新的陣列
                          //var all_files_result = data_files.slice()

                          // total_files_count 取得全部頁面的資料總數
                          //var total_files_count = all_files_only_id.length

                          // 取得該頁碼的資料
                          //data_files = data_files.slice( (current_page-1)*items_per_page, (current_page * items_per_page) )

                          if(req.query.get_all){
                            return res.status(200).json({ code: 200, files: data_files, total_files_count: all_files_only_id.length, previous_page: p_page, next_page: n_page, all_files: all_files_only_id})
                          }else{
                            return res.status(200).json({ code: 200, files: data_files, total_files_count: all_files_only_id.length, previous_page: p_page, next_page: n_page})
                          }


                        }

                      })

                    });


                  })

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

/* 儲存圖片及其資料 */
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

          if(req.query.api_key == CONFIG.appenv.full_api_key){ // 若是使用特殊的 api key，限只能站內使用
            if( ! (req.header('Referer')).includes(CONFIG.appenv.domain) ){
              return res.status(403).json({code: 403, msg:'無效存取！'})
            }
          }

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

        if(req.query.api_key == CONFIG.appenv.full_api_key){ // 若是使用特殊的 api key，限只能站內使用
          if( ! (req.header('Referer')).includes(CONFIG.appenv.domain) ){
            return res.status(403).json({code: 403, msg:'無效存取！'})
          }
        }

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
                  //redisFileDataModel.import_to_redis()
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

        if(req.query.api_key == CONFIG.appenv.full_api_key){ // 若是使用特殊的 api key，限只能站內使用
          if( ! (req.header('Referer')).includes(CONFIG.appenv.domain) ){
            return res.status(403).json({code: 403, msg:'無效存取！'})
          }
        }

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
                  //redisFileDataModel.import_to_redis()
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
    /*
    client_ssh_sftp.connect({
        host: CONFIG.appenv.storage.scp.ip,
        port: 22,
        username: CONFIG.appenv.storage.scp.user,
        password: CONFIG.appenv.storage.scp.password
    }).then(() => {
      return client_ssh_sftp.list('/root/web/imagebase');
    }).then((data) => {
      console.log(data, 'the data info111');
    }).catch((err) => {
      console.log(err, 'catch error111');
    });
    */

    if(req.query.api_key == undefined){
      return res.status(403).json({code: 403, msg:'未提供 API Key'})
    }
    apiKeyModel.getOne('api_key', req.query.api_key, function(results){
      if(results.length > 0 || req.query.api_key == CONFIG.appenv.full_api_key){

        if(req.query.api_key == CONFIG.appenv.full_api_key){ // 若是使用特殊的 api key，限只能站內使用
          if( ! (req.header('Referer')).includes(CONFIG.appenv.domain) ){
            return res.status(403).json({code: 403, msg:'無效存取！'})
          }
        }

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
                    // step 4: 刪除 資料表 files_transfer
                    fileTransferModel.deleteWhere('file_id', files[0].id, function(del_transfer_result){
                      // step 5: 刪除 實際檔案
                      if(CONFIG.appenv.env == 'local' || CONFIG.appenv.env == 'staging'){

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
                              //redisFileDataModel.import_to_redis()
                              return res.status(200).json({code: 200, msg:'刪除成功'})
                            })
                          }

                        })

                      }else{ // 非 local 端，刪除遠端路徑
                        let delete_file_path_array = []
                        JSON.parse(files[0].file_data).forEach(function(file_item, file_index){
                          // 取得欲刪除的檔案路徑
                          var file_path_split = files[0].file_path.split('/')
                          file_path_split.splice(0, 1)
                          var dir_path = file_path_split[0].split('_')
                          file_path_split.splice(0, 1)
                          var unlink_path = dir_path.join('/') + '/' + file_path_split.join('/')

                          var will_del_file_name = file_item.url.split('/').pop()  // 檔名

                          //var delete_file_path = CONFIG.path.project + '/' + unlink_path + '/' + will_del_file_name
                          delete_file_path_array.push(CONFIG.path.project + '/' + unlink_path + '/' + will_del_file_name)
                          //client_scp2: here
                        })

                        client_ssh_sftp.connect({
                            host: CONFIG.appenv.storage.scp.ip,
                            port: 22,
                            username: CONFIG.appenv.storage.scp.user,
                            password: CONFIG.appenv.storage.scp.password
                        }).then(() => {
                          delete_file_path_array.forEach(function(delete_file_item_path, file_item_index){
                            //console.log(file_item_path)
                            client_ssh_sftp.delete(delete_file_item_path)
                          })
                        }).then((data) => {
                          // step 5: 刪除 資料表 files
                          fileModel.deleteWhere('id', files[0].id, function(){
                            //redisFileDataModel.import_to_redis()
                            client_ssh_sftp.end()
                            return res.status(200).json({code: 200, msg:'刪除成功'})
                          })
                          //console.log(data, 'the data info');
                        }).catch((err) => {
                          console.log(err, 'catch error');
                        })

                      }

                    })


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

// 裁切
exports.image_crop = function(options){
  return function(req, res){
    //console.log('u_id: ' + req.session.u_id)
    //console.log('img_id: ' + req.body.img_id)
    var api_upload_dir = 'a'

    fileModel.getOne('u_id', req.body.img_id, function(file_result){

      // 將 「data:image\/png;base64,」移除，最後將「空白」問題，用「+」號取代。
      var base64Data = (req.body.img_data.replace(/^data:image\/png;base64,/, "")).replace(/\s/g, "+")

      var savePath = CONFIG.path.storage_uploads + '/' + api_upload_dir + '/' + file_result[0].category_id + '/' + 'crop_' + req.body.img_id + '.png'
      var dataBuffer = new Buffer(base64Data, 'base64')

    	fs.writeFile(savePath, dataBuffer, function(err) {
    		if(err){
          if (err) throw err
          return res.status(403).json({code: 403, msg: '發生不預期的錯誤。'})
    		}else{
          var file_data = JSON.parse(file_result[0].file_data)
          var new_file_data = []
          var file_name_arr = []
          var file_width_arr = [] // 縮放的寬度，舊的是 320、640、960；新的是 320、960

          // 取得原主檔名，並刪除
          let delete_file_path_array = []
          file_data.forEach(function(file_item, file_index){
            if(!file_item.origin){
              //file_item.url
              var original_filename_arr = (file_item.url).split('/')
              var original_full_name = original_filename_arr[original_filename_arr.length-1]
              var new_file_name = ((original_filename_arr[original_filename_arr.length-1]).split('.')[0])
              file_name_arr.push(new_file_name)
              file_width_arr.push(file_item.width)
              if(CONFIG.appenv.env == 'local' || CONFIG.appenv.env == 'staging'){ // 本機端刪檔
                if (fs.existsSync(CONFIG.path.storage_uploads + '/' + api_upload_dir + '/' + file_result[0].category_id + '/' + original_full_name)) {
                  fs.unlinkSync(CONFIG.path.storage_uploads + '/' + api_upload_dir + '/' + file_result[0].category_id + '/' + original_full_name)
                }
              }else{ // 遠端刪檔
                // 取得欲刪除的檔案路徑
                var file_path_split = file_result[0].file_path.split('/')
                file_path_split.splice(0, 1)
                var dir_path = file_path_split[0].split('_')
                file_path_split.splice(0, 1)
                var unlink_path = dir_path.join('/') + '/' + file_path_split.join('/')

                var will_del_file_name = file_item.url.split('/').pop()  // 檔名

                //var delete_file_path = CONFIG.path.project + '/' + unlink_path + '/' + will_del_file_name
                delete_file_path_array.push(CONFIG.path.project + '/' + unlink_path + '/' + will_del_file_name)
                //client_scp2: here

              }
            }else{
              new_file_data.push(file_item)
            }
          })

          client_ssh_sftp.connect({
              host: CONFIG.appenv.storage.scp.ip,
              port: 22,
              username: CONFIG.appenv.storage.scp.user,
              password: CONFIG.appenv.storage.scp.password
          }).then(() => {
            delete_file_path_array.forEach(function(delete_file_item_path, file_item_index){
              //console.log(file_item_path)
              client_ssh_sftp.delete(delete_file_item_path)
            })
          }).then((data) => {
            // step 5: 刪除 資料表 files
            client_ssh_sftp.end()
            //console.log(data, 'the data info');
          }).catch((err) => {
            console.log(err, 'catch error');
          })


          var to_file_path = CONFIG.path.storage_uploads + '/' + api_upload_dir + '/' + file_result[0].category_id
          let waterfall_func_arr = [];
          file_width_arr.forEach(function(file_width_item, file_width_index){
            waterfall_func_arr.push(function(callback){
              sharp(savePath).resize(file_width_arr[file_width_index], null).toFile(to_file_path + '/' + file_name_arr[file_width_index] + '.png', function(err, file_sharp) {
                new_file_data.push({
                  format: file_sharp.format,
                  width: file_sharp.width,
                  height: file_sharp.height,
                  size: file_sharp.size,
                  origin: false,
                  url: CONFIG.appenv.storage.path + '/' + api_upload_dir + '/' + file_result[0].category_id + '/' + file_name_arr[file_width_index] + '.png'
                })
                callback(null);
              })
            });

          })

          async.waterfall(waterfall_func_arr, function (err, result) {
            if (err) {
              console.log(err);
            }
            var update_obj = {file_data: JSON.stringify(new_file_data)}
            var where_obj = {u_id: file_result[0].u_id}
            fileModel.update(update_obj, where_obj, true, function(file_update_result){

              //redisFileDataModel.import_to_redis()

              if (fs.existsSync(savePath)) {
                fs.unlinkSync(savePath)
              }

              // 複製檔案至 storage
              if(CONFIG.appenv.env == 'production'){
                /*
                console.log("here_p");
                console.log(file_name_arr);
                file_name_arr.forEach(function(file_name_item, file_name_index){
                  console.log("here2_" + file_name_index);
                  client_scp2.upload(to_file_path + '/' + file_name_item + '.png', CONFIG.appenv.storage.storage_uploads_path + '/' + api_upload_dir + '/' + file_result[0].category_id + '/' + file_name_item + '.png', function(){
                    console.log("here_" + file_name_index);
                    // 將原本機端的原檔案刪除
                    fs.unlinkSync(to_file_path + '/' + file_name_item + '.png')
                    console.log("here_d")
                    if(file_name_arr.length == file_name_index + 1){
                      console.log("here_if")
                      return res.status(200).json({code: 200, msg: '裁切成功。'})
                    }
                  })
                })
                */
                let scp_func_arr = [];
                file_name_arr.forEach(function(file_name_item, file_name_index){
                  scp_func_arr.push(function(callback){
                    console.log("here1_" + file_name_index);
                    client_scp2.upload(to_file_path + '/' + file_name_item + '.png', CONFIG.appenv.storage.storage_uploads_path + '/' + api_upload_dir + '/' + file_result[0].category_id + '/' + file_name_item + '.png', function(){
                      console.log("here_u_" + file_name_index);
                      // 將原本機端的原檔案刪除
                      fs.unlinkSync(to_file_path + '/' + file_name_item + '.png')
                      callback(null);
                    })
                  });
                })
                async.waterfall(scp_func_arr, function (err, result) {
                  console.log("here_done")
                  return res.status(200).json({code: 200, msg: '裁切成功。'})
                })
              }else{
                return res.status(200).json({code: 200, msg: '裁切成功。'})
              }

            })
          });

    		}
    	})

    })


  }
}

// 更新資料
exports.image_put_data = function(options){
  return function(req, res){
    if(req.query.api_key == undefined){
      return res.status(403).json({code: 403, msg:'未提供 API Key'})
    }
    apiKeyModel.getOne('api_key', req.query.api_key, function(results){
      if(results.length > 0 || req.query.api_key == CONFIG.appenv.full_api_key){

        if(req.query.api_key == CONFIG.appenv.full_api_key){ // 若是使用特殊的 api key，限只能站內使用
          if( ! (req.header('Referer')).includes(CONFIG.appenv.domain) ){
            return res.status(403).json({code: 403, msg:'無效存取！'})
          }
        }

        // 若是 full_api_key 的話，不需要將 request_times 加 1
        if(req.query.api_key != CONFIG.appenv.full_api_key){
          if(results.length > 0){
            // 將此 api_key 的 request_times 次數加 1
            apiKeyModel.update({'request_times': results[0].request_times + 1}, {'api_key': req.query.api_key}, true, function(){})
          }
        }

        var form = new formidable.IncomingForm()
        form.encoding = 'utf-8'
        form.keepExtensions = true

        form.parse(req, function(err, fields, files) {

          fileModel.getOne('u_id', req.params.u_id, function(file_result){
            if(file_result.length == 0){
              return res.status(404).json({ code: 404, error: { 'message': '找不到該檔案'} })
            }
            // 儲存 tags
            if(fields.tags == undefined){
              var change_tags = ''
            }else{
              var change_tags = fields.tags
            }
            save_tags((change_tags).trim(), file_result[0].id)

            if(fields.title == undefined){
              var modify_title = ''
            }else{
              var modify_title = fields.title
            }
            var update_obj = { title: modify_title, category_id: fields.category, permissions: fields.permissions }
            var where_obj = { u_id: req.params.u_id }
            fileModel.update(update_obj, where_obj, true, function(update_results){
              //redisFileDataModel.import_to_redis()
              return res.status(200).json({code: 200, msg:'更新成功'})
            })

          })

        })


      }else{
        return res.status(403).json({code: 403, msg:'未經授權的 API Key'})
      }
    })
  }
}
