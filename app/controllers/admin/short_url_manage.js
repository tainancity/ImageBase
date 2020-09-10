var CONFIG = require('../../config/global.js')
var userModel = require(CONFIG.path.models + '/user.js')
var shortUrlModel = require(CONFIG.path.models + '/short_urls.js')
var functions = require(CONFIG.path.helpers + '/functions.js')

var check_u_id = function(req, res, save_obj, cb){
  shortUrlModel.getOne('u_id', save_obj.u_id, function(results_check){
    if(results_check.length == 1){
      var unique_id = functions.generate_random_code( parseInt(save_obj.u_id.length) + 1 )
      save_obj.u_id = unique_id
      check_u_id(req, res, save_obj, function(){
        save_data(req, res, save_obj)
      })
    }else{
      cb()
    }

  })
}

var validUrl = function(str){
  var pattern = /(http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;
  if(!pattern.test(str)) {
    return false;
  } else {
    return true;
  }
}

var save_data = function(req, res, save_obj){
  shortUrlModel.save(save_obj, true, function(save_results){
    res.redirect('/admin/short_url/list')
  })
}

// 短網址列表
exports.short_url_list = function(options) {
  return function(req, res) {
    var show_uploader_and_organ = false
    if( (req.originalUrl).includes('/admin/management/short_url/list') || (req.originalUrl).includes('/admin/organization/short_url/list') ){
      var show_uploader_and_organ = true
    }

    var sort_obj = { column: 'created_at', sort_type: 'DESC' }

    if(show_uploader_and_organ){ // 管理者


      userModel.getOne('u_id', req.session.u_id, function(the_user_results){
        if(the_user_results[0].role_id == 1){ // 平台管理者
          userModel.getAll(sort_obj, function(user_results){
            shortUrlModel.getAll(sort_obj, function(results){

              results.forEach(function(url_item, url_index){
                user_results.forEach(function(user_item, user_index){
                  if(url_item.user_id == user_item.id){
                    results[url_index].pid = user_item.pid
                  }
                })

              })

              let url_on = []
              let url_off = []
              results.forEach(function(url_item, url_index){
                if(url_item.is_active == 1){
                  url_on.push(url_item)
                }else{
                  url_off.push(url_item)
                }
              })
              res.render('admin/short_url/list', {short_urls_on: url_on, short_urls_off: url_off, show_uploader_and_organ: show_uploader_and_organ, csrfToken: req.csrfToken()})
            })
          })
        }else if(the_user_results[0].role_id == 3){ // 局處管理者
          userModel.getAll(sort_obj, function(user_results){
            shortUrlModel.getAll(sort_obj, function(results){

              let show_urls = [];
              results.forEach(function(url_item, url_index){
                user_results.forEach(function(user_item, user_index){
                  if(the_user_results[0].organ_id == user_item.organ_id){
                    if(url_item.user_id == user_item.id){
                      results[url_index].pid = user_item.pid
                      show_urls.push(results[url_index]);
                    }
                  }
                })
              })

              let url_on = []
              let url_off = []
              show_urls.forEach(function(url_item, url_index){
                if(url_item.is_active == 1){
                  url_on.push(url_item)
                }else{
                  url_off.push(url_item)
                }
              })
              res.render('admin/short_url/list', {short_urls_on: url_on, short_urls_off: url_off, show_uploader_and_organ: show_uploader_and_organ, csrfToken: req.csrfToken()})
            })
          })
        }else{

        }
      })

    }else{ // 一般公務帳號

      userModel.getOne('u_id', req.session.u_id, function(the_user_results){

        var where_obj = { column_name: 'user_id', operator: "=", column_value: the_user_results[0].id }
        shortUrlModel.getAllWhere(sort_obj, where_obj, function(results){
          let url_on = []
          let url_off = []
          results.forEach(function(url_item, url_index){
            if(url_item.is_active == 1){
              url_on.push(url_item)
            }else{
              url_off.push(url_item)
            }
          })
          res.render('admin/short_url/list', {short_urls_on: url_on, short_urls_off: url_off, show_uploader_and_organ: show_uploader_and_organ, csrfToken: req.csrfToken()})
        })

      })
    }


  }
}

// 短網址產生
exports.short_url_post = function(options) {
  return function(req, res) {

    if(validUrl(req.body.long_url)){
      userModel.getOne('u_id', req.session.u_id, function(the_user_results){

        var unique_id = functions.generate_random_code(4)
        var save_obj = {
          u_id: unique_id,
          user_id: the_user_results[0].id,
          long_url: req.body.long_url,
          pageviews: 0,
          is_active: 1
        }

        check_u_id(req, res, save_obj, function(){
          save_data(req, res, save_obj)
        })

      })
    }else{
      res.redirect('/admin/short_url/list')
    }


  }
}

// 短網址上下架
exports.short_url_is_active = function(options) {
  return function(req, res) {
    //console.log(req.params.short_url_id)
    //console.log("狀態：" + req.query.on)

    shortUrlModel.getOne('u_id', req.params.short_url_id, function(results_url){
      if(results_url.length == 1){
        shortUrlModel.update({ is_active: req.query.on }, { u_id: req.params.short_url_id }, true, function(result){
          //res.redirect('/admin/short_url/list')
          res.redirect('back')
        })
      }else{
        //res.redirect('/admin/short_url/list')
        res.redirect('back')
      }

    })

  }
}
