var CONFIG = require('../../config/global.js')
var userModel = require(CONFIG.path.models + '/user.js')
var organizationModel = require(CONFIG.path.models + '/organization.js')
//var functions = require(CONFIG.path.helpers + '/functions.js')

exports.index = function(options) {
  return function(req, res) {
    userModel.getOne('u_id', req.session.u_id, function(results){
      // 取得 organ_id 對應的 organ_name
      var sort_obj_for_organ = { "column": "created_at", "sort_type": "DESC" }
      organizationModel.getAll(sort_obj_for_organ, function(results_organ){
        results.forEach(function(element, index, arr) {
          // arr 是原來的 results 陣列
          results_organ.forEach(function(organ, i, arra_organ){
            if(element.organ_id == organ.organ_id){
              results[index].organ_name = organ.organ_name
            }
          })
        })
        //console.log(results)
        //res.render('admin/management/all_members', {members: results})
        res.render('admin/pages/account', {account: results[0]})
      })


    })

  }
}

exports.all_members = function(options){
  return function(req, res){
    var sort_obj = { "column": "created_at", "sort_type": "DESC" }
    userModel.getAll(sort_obj, function(results){

      // 取得 organ_id 對應的 organ_name
      var sort_obj_for_organ = { "column": "created_at", "sort_type": "DESC" }
      organizationModel.getAll(sort_obj_for_organ, function(results_organ){
        results.forEach(function(element, index, arr) {
          // arr 是原來的 results 陣列
          results_organ.forEach(function(organ, i, arra_organ){
            if(element.organ_id == organ.organ_id){
              results[index].organ_name = organ.organ_name
            }
          })
        })
        //console.log(results)
        res.render('admin/management/all_members', {members: results})
      })

    })
  }
}
