var CONFIG = require('../../config/global.js')
var userModel = require(CONFIG.path.models + '/user.js')
//var functions = require(CONFIG.path.helpers + '/functions.js')

exports.index = function(options) {
  return function(req, res) {
    res.render('admin/pages/account')
  }
}

exports.all_members = function(options){
  return function(req, res){
    var sort_obj = {
      "column": "created_at",
      "sort_type": "DESC"
    }
    userModel.getAll(sort_obj, function(results){
      console.log(results)
      res.render('admin/management/all_members', {members: results})
    })
  }
}
