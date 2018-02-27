var formidable = require('formidable')
var fs = require('fs')
var util = require('util')

var CONFIG = require('../config/global.js')
//var userModel = require(CONFIG.path.models + '/user.js')
//var functions = require(CONFIG.path.helpers + '/functions.js')

// CONFIG.appenv.storage.scp.user + ':' + CONFIG.appenv.storage.scp.password + '@' + CONFIG.appenv.storage.scp.ip

exports.index = function(options) {
  return function(req, res) {
    // { csrfToken: req.csrfToken() }
    var a = 'abctd'
    res.render('frontend/index', {testVar: a})
  }
}
