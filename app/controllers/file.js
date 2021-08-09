const CONFIG = require('../config/global.js')
const async = require("async");
//var userModel = require(CONFIG.path.models + '/user.js')
//var functions = require(CONFIG.path.helpers + '/functions.js')
const fileModel = require(CONFIG.path.models + '/file.js')
const fileTagModel = require(CONFIG.path.models + '/file_tag.js')
const tagModel = require(CONFIG.path.models + '/tag.js')
const fileCategoryModel = require(CONFIG.path.models + '/file_category.js')
const organizationModel = require(CONFIG.path.models + '/organization.js')
//const redisFileDataModel = require(CONFIG.path.redis + '/redis_file_data.js')

exports.item = function(options) {
  return function(req, res) {
    //console.log(req.params.u_id);

    async.waterfall([

      function(callback) { // 取得檔案
        fileModel.getOne("u_id", req.params.u_id, function(files){
          if(files.length > 0){
            callback(null, files[0]);
          }else{
            callback(null, null);
          }

        });
      },
      function(file, callback) { // 取得 tags
        if(file == null){
          callback(null, null);
        }else{
          fileTagModel.getAllWhere({ "column": "id", "sort_type": "DESC" }, { "column_name": "file_id", "operator": "=", "column_value": file.id }, function(file_tags){
            //console.log("file id: " + file.id);
            //console.log(file_tags);
            if(file_tags.length > 0){
              let tags_id_str = "";
              file_tags.forEach((item, i) => {
                tags_id_str += ((i == 0) ? "" : ",") + item.tag_id;
              });

              tagModel.getAllWhere({"column": "id", "sort_type": "DESC"}, { "column_name": "id", "operator": "IN", "column_value": "(" + tags_id_str + ")" }, function(tags){
                let tags_str = "";
                tags.forEach((item, i) => {
                  tags_str += ((i == 0) ? "" : ",") + item.tag_name;
                });
                file.tags = tags_str;
                callback(null, file);
              });

            }else{
              file.tags = "";
              callback(null, file);
            }

          });
        }
      },
      function(file, callback){ // 取得 分類
        if(file == null){
          callback(null, null);
        }else{
          fileCategoryModel.getOne("id", file.category_id, function(file_category){
            file.category_name = file_category[0].category_name;
            //console.log(file);
            callback(null, file);
          });
        }
      },
      function(file, callback){ // 取得 組織
        if(file == null){
          callback(null, null);
        }else{
          organizationModel.getOne("organ_id", file.organ_id, function(file_organ){
            file.organization_name = file_organ[0].organ_name;
            callback(null, file);
          });
        }
      }
    ], function (err, file) {
      if(file != null){
        if(file.deleted_at == null){
          file.deleted_at = ''
        }
        if(file.title == null){
          file.title = ''
        }
      }

      res.render('frontend/files/item', {
        file_u_id: req.params.u_id,
        file_obj: file,
        csrfToken: req.csrfToken()
      })
    });


    /*
    redisFileDataModel.get_file(req.params.u_id, function(file_obj){
      //console.log(file_obj)
      res.render('frontend/files/item', {
        file_u_id: req.params.u_id,
        file_obj: file_obj,
        csrfToken: req.csrfToken()
      })
    })
    */
  }
}

exports.item_iframe = function(options){
  return function(req, res) {
    //console.log(req.params.u_id)
    async.waterfall([
      function(callback) {
        fileModel.getOne("u_id", req.params.u_id, function(files){
          callback(null, files[0]);
        });
      }
    ], function (err, file) {

      if(file == undefined){
        res.render('frontend/files/item_iframe', {
          file_obj: file
        })
      }else{
        if(file.deleted_at == null){
          file.deleted_at = ''
        }
        if(file.title == null){
          file.title = ''
        }

        res.render('frontend/files/item_iframe', {
          file_obj: file
        })
      }

    });
  }
}
