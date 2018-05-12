var CONFIG = require('../../config/global.js')
var userModel = require(CONFIG.path.models + '/user.js')
var shortUrlModel = require(CONFIG.path.models + '/short_urls.js')
var functions = require(CONFIG.path.helpers + '/functions.js')

// 短網址列表
exports.short_url_list = function(options) {
  return function(req, res) {
    var show_uploader_and_organ = false
    if((req.originalUrl).includes('/admin/management/short_url/list')){
      var show_uploader_and_organ = true
    }

    var sort_obj = { column: 'created_at', sort_type: 'DESC' }

    if(show_uploader_and_organ){ // 管理者

      userModel.getAll(sort_obj, function(user_results){
        shortUrlModel.getAll(sort_obj, function(results){

          results.forEach(function(url_item, url_index){
            user_results.forEach(function(user_item, user_index){
              if(url_item.user_id == user_item.id){
                results[url_index].pid = user_item.pid
              }
            })

          })
          res.render('admin/short_url/list', {short_urls: results, show_uploader_and_organ: show_uploader_and_organ, csrfToken: req.csrfToken()})
        })
      })

    }else{ // 一般公務帳號

      userModel.getOne('u_id', req.session.u_id, function(the_user_results){

        var where_obj = { column_name: 'user_id', operator: "=", column_value: the_user_results[0].id }
        shortUrlModel.getAllWhere(sort_obj, where_obj, function(results){
          res.render('admin/short_url/list', {short_urls: results, show_uploader_and_organ: show_uploader_and_organ, csrfToken: req.csrfToken()})
        })

      })
    }


  }
}
