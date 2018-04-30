var CONFIG = require('../config/global.js')
var announcementModel = require(CONFIG.path.models + '/announcement.js')
//var functions = require(CONFIG.path.helpers + '/functions.js')

exports.list = function(options) {
  return function(req, res) {
    var sort_obj = { "column": "sort_index", "sort_type": "ASC" }
    var where_obj = { "column_name": "is_draft", "operator": "=", "column_value": 0 }
    announcementModel.getAllWhere(sort_obj, where_obj, function(results){
      res.render('frontend/announcement/list', {results: results})
    })

  }
}
