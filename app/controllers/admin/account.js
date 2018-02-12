var CONFIG = require('../../config/global.js')
var userModel = require(CONFIG.path.models + '/user.js')
var organizationModel = require(CONFIG.path.models + '/organization.js')
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
      results.forEach(function(element, index, arr) {
        // arr 是原來的 results 陣列
        organizationModel.getOne('organ_id', element.organ_id, function(result_organ){
          results[index].organ_name = result_organ[0].organ_name
          if((index+1) == arr.length){ // 當 index 執行到最後一筆時，即等於 arr.length，才回傳
            res.render('admin/management/all_members', {members: results})
          }
        })
      });

    })
  }
}
