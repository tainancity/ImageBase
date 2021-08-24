var CONFIG = require('../../config/global.js')
var settingModel = require(CONFIG.path.models + '/setting.js')
//var functions = require(CONFIG.path.helpers + '/functions.js')

// 顯示設定頁面
exports.index = function(options) {
  return function(req, res) {
    sort_obj = { "column": "id", "sort_type": "DESC" }
    settingModel.getAll(sort_obj, function(results){
      /*
      var upload_filesize_limit_item
      results.forEach(function(entry) {
        if(entry.option_name == 'upload_filesize_limit'){
          upload_filesize_limit_item = entry
        }
      })
      */
      res.render('admin/management/settings/index', {csrfToken: req.csrfToken(), settings: results})
    })
  }
}

// 設定頁面的 post
exports.index_post = function(options) {
  return function(req, res) {
    if (req.body.upload_filesize_limit == 0 || req.body.upload_filesize_limit == '' || req.body.upload_filesize_limit > 20480 || isNaN(req.body.upload_filesize_limit) || req.body.upload_filesize_limit.charAt(0) == '0'){
      req.body.upload_filesize_limit = 20480
    }

    var update_obj = {"option_value": req.body.upload_filesize_limit}
    var where_obj = {"option_name": "upload_filesize_limit"}
    settingModel.update(update_obj, where_obj, true, function(){
      var update_ga_code_obj = {"option_value": req.body.ga_code}
      var where_ga_code_obj = {"option_name": "ga_code"}
      settingModel.update(update_ga_code_obj, where_ga_code_obj, true, function(){
        var update_is_maintenance_obj = {"option_value": req.body.is_maintenance}
        var where_is_maintenance_obj = {"option_name": "is_maintenance"}
        settingModel.update(update_is_maintenance_obj, where_is_maintenance_obj, true, function(){

          var update_upload_filetotal_limit_obj = {"option_value": req.body.upload_filetotal_limit}
          var where_upload_filetotal_limit_obj = {"option_name": "upload_filetotal_limit"}
          settingModel.update(update_upload_filetotal_limit_obj, where_upload_filetotal_limit_obj, true, function(){
            res.redirect('/admin/management/settings')
          })

        })
      })
    })

  }
}

// 設定 logo_file 的 post 儲存
exports.logo_file_post = function(options) {
  return function(req, res) {

    var update_obj = {"option_value": req.body.logo_file}
    var where_obj = {"option_name": "logo_file"}
    settingModel.update(update_obj, where_obj, true, function(){
      res.json({result: 1})
    })

  }
}
