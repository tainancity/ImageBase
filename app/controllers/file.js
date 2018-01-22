//var CONFIG = require('../config/global.js')
//var userModel = require(CONFIG.path.models + '/user.js')
//var functions = require(CONFIG.path.helpers + '/functions.js')

exports.item = function(options) {
  return function(req, res) {
    res.render('frontend/files/item')
  }
}
