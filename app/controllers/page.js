//var CONFIG = require('../config/global.js')
//var userModel = require(CONFIG.path.models + '/user.js')
//var functions = require(CONFIG.path.helpers + '/functions.js')

exports.service = function(options) {
  return function(req, res) {
    res.render('frontend/pages/service')
  }
}

exports.maintain = function(options) {
  return function(req, res) {
    res.render('frontend/pages/maintain')
  }
}
