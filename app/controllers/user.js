var formidable = require('formidable')
var util = require('util')

//var CONFIG = require('../config/global.js')
//var userModel = require(CONFIG.path.models + '/user.js')
//var functions = require(CONFIG.path.helpers + '/functions.js')

exports.login = function(options) {
  return function(req, res) {
    res.render('frontend/user/login', { csrfToken: req.csrfToken() })
  }
}
