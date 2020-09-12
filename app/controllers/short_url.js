var CONFIG = require('../config/global.js')
//var userModel = require(CONFIG.path.models + '/user.js')
//var functions = require(CONFIG.path.helpers + '/functions.js')
var shortUrlModel = require(CONFIG.path.models + '/short_urls.js')

exports.short_url_redirect = function(options) {
  return function(req, res, next) {
    //console.log(req.params.u_id)
    shortUrlModel.getOne('u_id', req.params.u_id, function(short_url_result){
      if(short_url_result.length > 0){
        if(short_url_result[0].is_active == 1 && short_url_result[0].deleted_at == null){ // 上架狀態且未刪除
          // 更新瀏覽量
          var new_pageviews = short_url_result[0].pageviews + 1
          var update_obj = {'pageviews': new_pageviews}
          var where_obj = {'u_id': req.params.u_id}
          shortUrlModel.update(update_obj, where_obj, true, function(result){
            return res.status(302).redirect(short_url_result[0].long_url)
          })
        }else{ // 下架狀態或已軟刪除
          next()
        }
      }else{
        next()
      }

    })
  }
}
