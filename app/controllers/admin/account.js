var CONFIG = require('../../config/global.js')
var userModel = require(CONFIG.path.models + '/user.js')
var organizationModel = require(CONFIG.path.models + '/organization.js')
var apiKeyModel = require(CONFIG.path.models + '/api_key.js')
var functions = require(CONFIG.path.helpers + '/functions.js')

var generate_api_key
var api_key_duplicate = false

// 檢查是否有重覆的 api_key
var check_api_key = function(api_key, cb){
  apiKeyModel.getOne('api_key', api_key, function(results_check){
    if(results_check.length == 1){
      //console.log("相同的 api_key 產生")
      api_key_duplicate = true
    }else{
      api_key_duplicate = false
    }
    cb()
  })
}

var duplicate_func = function(req, res){
  if(api_key_duplicate){
    generate_api_key = functions.generate_api_key()
    //console.log("新的 api key：" + generate_api_key)
    check_api_key(generate_api_key, function(){
      duplicate_func(req, res)
    })
  }else{
    userModel.getOne('u_id', req.session.u_id, function(results){
      apiKeyModel.getOne('user_id', results[0].id, function(results_check){
        if(results_check.length >= 1){
          //console.log("已申請過")
          res.redirect('/admin/account')
        }else{
          var insert_obj = {
            user_id: results[0].id,
            api_key: generate_api_key,
            request_times: 0
          }
          apiKeyModel.save(insert_obj, true, function(){
            res.redirect('/admin/account')
          })
        }
      })

    })
  }
}

exports.index = function(options) {
  return function(req, res) {
    userModel.getOne('u_id', req.session.u_id, function(results){

      apiKeyModel.getOne('user_id', results[0].id, function(api_result){
        if(api_result.length == 1){
          results[0].api_key = api_result[0].api_key
          results[0].request_times = api_result[0].request_times
        }else{
          results[0].api_key = ''
          results[0].request_times = ''
        }
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
          res.render('admin/pages/account', {account: results[0], csrfToken: req.csrfToken()})
        })
      })

    })

  }
}

// 申請 api key
exports.apply_api_key = function(options){
  return function(req, res){
    generate_api_key = functions.generate_api_key()
    //generate_api_key = 'oydsOH3Cef7YP4SxnebJ6g8DnN5O5qOw'
    check_api_key(generate_api_key, function(){
      duplicate_func(req, res)
    })
  }
}

// 所有公務帳號
exports.all_members = function(options){
  return function(req, res){

    let c_page = 1;
    if(req.query.page != undefined && req.query.page != ""){
      c_page = req.query.page;
    }

    let items_per_page = 50;
    let limit_number_arr = [items_per_page * (parseInt(c_page) - 1), items_per_page];

    userModel.getAllCount(function(result){
      // console.log(result[0].total_count);
      let total_count = result[0].total_count;
      let total_pages = Math.ceil(total_count / items_per_page);
      //console.log("共" + total_pages);

      let sort_obj = { "column": "created_at", "sort_type": "DESC" };
      userModel.getAllLimit(sort_obj, limit_number_arr, function(results){

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

          var sort_obj_for_api_key = { "column": "created_at", "sort_type": "DESC" }
          apiKeyModel.getAll(sort_obj_for_api_key, function(results_apikey){
            results.forEach(function(element, index, arr) {
              // arr 是原來的 results 陣列
              results_apikey.forEach(function(api_key_item, i){
                if(element.id == api_key_item.user_id){
                  results[index].api_key = api_key_item.api_key
                  results[index].api_request_times = api_key_item.request_times
                }
              })
            })
            //console.log(results)
            res.render('admin/management/all_members', {members: results, total_pages: total_pages, c_page: c_page, csrfToken: req.csrfToken()})
          })


        })

      })

    });
  }
}
