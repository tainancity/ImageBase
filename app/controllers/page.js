var CONFIG = require('../config/global.js')
var settingModel = require(CONFIG.path.models + '/setting.js')
//var functions = require(CONFIG.path.helpers + '/functions.js')

exports.service = function(options) {
  return function(req, res) {

    settingModel.getOne('option_name', 'platform_desc', function(result){
      res.render('frontend/pages/service', {setting: result[0]})
    })
  }
}

exports.maintain = function(options) {
  return function(req, res) {
    settingModel.getOne('option_name', 'maintenance_desc', function(result){
      res.render('frontend/pages/maintain', {setting: result[0]})
    })
    //res.render('frontend/pages/maintain')
  }
}
