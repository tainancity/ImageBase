var formidable = require('formidable')
var fs = require('fs')
var util = require('util')

var CONFIG = require('../config/global.js')
var announcementModel = require(CONFIG.path.models + '/announcement.js')
//var userModel = require(CONFIG.path.models + '/user.js')
//var functions = require(CONFIG.path.helpers + '/functions.js')

// CONFIG.appenv.storage.scp.user + ':' + CONFIG.appenv.storage.scp.password + '@' + CONFIG.appenv.storage.scp.ip

exports.index = function(options) {
  return function(req, res) {
    var sort_obj = { "column": "sort_index", "sort_type": "ASC" }
    var where_obj = { "column_name": "is_draft", "operator": "=", "column_value": 0 }
    announcementModel.getAllWhere(sort_obj, where_obj, function(results){
      res.render('frontend/index', {results: results})
    })
  }
}
