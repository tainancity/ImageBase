var CONFIG = require('../../config/global.js')
var userModel = require(CONFIG.path.models + '/user.js')
var logLoginModel = require(CONFIG.path.models + '/log_login.js')
//var functions = require(CONFIG.path.helpers + '/functions.js')

exports.log_login = function(options){
  return function(req, res){

    var sort_obj = { "column": "created_at", "sort_type": "ASC" }
    var where_obj = { "column_name": "user_id", "operator": ">=", "column_value": 1 }

    logLoginModel.getAllWhere(sort_obj, where_obj, function(results){

      // 取得 user 資料
      var sort_obj_for_user = { "column": "created_at", "sort_type": "DESC" }
      userModel.getAll(sort_obj_for_user, function(results_user){
        results.forEach(function(element, index, arr) {
          // arr 是原來的 results 陣列
          results_user.forEach(function(user, i, array_users){
            if(element.user_id == user.id){
              results[index].pid = user.pid
            }
          })
        })
        //console.log(results)
        res.render('admin/management/log_login', {logs: results})
      })

    })

  }
}
