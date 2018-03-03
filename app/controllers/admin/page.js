var CONFIG = require('../../config/global.js')
var settingModel = require(CONFIG.path.models + '/setting.js')
//var functions = require(CONFIG.path.helpers + '/functions.js')

// 顯示服務說明
exports.service = function(options) {
  return function(req, res) {
    settingModel.getOne('option_name', 'platform_desc', function(result){
      res.render('admin/management/pages/service', { csrfToken: req.csrfToken(), setting: result[0] })
    })
  }
}

// 儲存服務說明
exports.service_post = function(options) {
  return function(req, res) {
    var update_obj = {'option_value': req.body.platform_desc}
    var where_obj = {'option_name': 'platform_desc'}
    settingModel.update(update_obj, where_obj, function(){
      res.redirect('/admin/management/service')
    })
  }
}

// 維護模式頁面內容
exports.maintenance = function(options) {
  return function(req, res) {
    settingModel.getOne('option_name', 'maintenance_desc', function(result){
      res.render('admin/management/pages/maintenance', { csrfToken: req.csrfToken(), setting: result[0] })
    })
  }
}

// 儲存維護模式頁面內容
exports.maintenance_post = function(options) {
  return function(req, res) {
    var update_obj = {'option_value': req.body.maintenance_desc}
    var where_obj = {'option_name': 'maintenance_desc'}
    settingModel.update(update_obj, where_obj, function(){
      res.redirect('/admin/management/maintenance')
    })
  }
}
