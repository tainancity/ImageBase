var CONFIG = require('../../config/global.js')
var userModel = require(CONFIG.path.models + '/user.js')
var fileModel = require(CONFIG.path.models + '/file.js')
var fileCategoryModel = require(CONFIG.path.models + '/file_category.js')
var organizationModel = require(CONFIG.path.models + '/organization.js')
var functions = require(CONFIG.path.helpers + '/functions.js')

exports.file_list = function(options) {
  return function(req, res) {
    // csrfToken: req.csrfToken()
    var show_uploader_and_organ = false
    if(req.originalUrl == '/admin/management/file/list'){
      var show_uploader_and_organ = true
    }

    var sort_obj = { column: "created_at", sort_type: "DESC" }
    var where_obj = { column_name: "deleted_at", operator: "", column_value: 'IS NULL' }
    var prepare_data = []

    organizationModel.getAll({column: 'id', sort_type: 'DESC'}, function(all_organs){
      //console.log(all_organs)
      userModel.getAll({column: 'id', sort_type: 'DESC'}, function(all_users){
        //console.log(all_users)
        fileCategoryModel.getAll({column: 'id', sort_type: 'DESC'}, function(all_categories){
          //console.log(all_categories)

          fileModel.getAllWhere(sort_obj, where_obj, function(files){
            files.forEach(function(item, index) {

              // 找出所屬組織名稱
              all_organs.forEach(function(the_organ, organ_index){
                if(item.organ_id == the_organ.organ_id){
                  item.organ_name = the_organ.organ_name
                  prepare_data.push(item)
                }
              })
              // 找出使用者名稱
              all_users.forEach(function(the_user, user_index){
                if(item.user_id == the_user.id){
                  item.pid = the_user.pid
                  prepare_data.push(item)
                }
              })
              // 找出分類名稱
              all_categories.forEach(function(the_category, category_index){
                if(item.category_id == the_category.id){
                  item.category_name = the_category.category_name
                  prepare_data.push(item)
                }
              })


              if(files.length == index + 1){
                if(!show_uploader_and_organ){ // 一般公務帳號
                  userModel.getOne('u_id', req.session.u_id, function(user_results){
                    //console.log(files)
                    var ori_files = files.slice()
                    ori_files.forEach(function(each_item, each_index){
                      if(each_item.user_id != user_results[0].id){
                        files.forEach(function(each_files_item, each_files_index){
                          if(each_files_item.user_id != user_results[0].id){
                            files.splice(each_files_index, 1)
                          }
                        })
                      }
                      if(each_index+1 == ori_files.length){
                        res.render('admin/image/files/list', {files: files, show_uploader_and_organ: show_uploader_and_organ})
                      }
                    })
                  })
                }else{ // 管理者
                  res.render('admin/image/files/list', {files: files, show_uploader_and_organ: show_uploader_and_organ})
                }
              }

            })
          })

        })
      })
    })

  }
}

/*
// 建立分類
exports.image_categories_create = function(options) {
  return function(req, res) {
    var sort_obj = { "column": "id", "sort_type": "DESC" }
    fileCategoryModel.getAll(sort_obj, function(results){
      res.render('admin/image/categories/create', {categories: results, csrfToken: req.csrfToken()})
    })
  }
}

// 建立分類：資料送出
exports.image_categories_create_post = function(options) {
  return function(req, res) {
    fileCategoryModel.getOne('id', req.body.parent_category_id, function(results){
      if(results.length == 0){
        var category_level = 1
      }else{
        var category_level = results[0].level + 1
      }
      var insert_obj = {
        category_name: req.body.category_name,
        level: category_level,
        parent_category_id: req.body.parent_category_id,
        sort_index: 0
      }
      fileCategoryModel.save(insert_obj, false, function(results){
        res.redirect('/admin/management/image_categories')
      })
    })

  }
}

// 編輯分類
exports.image_categories_edit = function(options) {
  return function(req, res) {
    var sort_obj = { "column": "id", "sort_type": "DESC" }
    fileCategoryModel.getAll(sort_obj, function(results){
      //res.render('admin/image/categories/edit', {categories: results, csrfToken: req.csrfToken()})
      fileCategoryModel.getOne('id', req.params.itemId, function(result){
        res.render('admin/image/categories/edit', {categories: results, category: result[0], csrfToken: req.csrfToken()})
      })
    })
  }
}

// 編輯分類：資料送出
exports.image_categories_edit_post = function(options) {
  return function(req, res) {
    fileCategoryModel.getOne('id', req.body.parent_category_id, function(results){
      if(results.length == 0){
        var category_level = 1
      }else{
        var category_level = results[0].level + 1
      }
      var update_obj = {
        category_name: req.body.category_name,
        level: category_level,
        parent_category_id: req.body.parent_category_id
      }
      var where_obj = {
        id: req.body.category_id
      }
      fileCategoryModel.update(update_obj, where_obj, false, function(results){
        res.redirect('/admin/management/image_categories')
      })
    })
  }
}

// 刪除分類
exports.image_categories_delete = function(options) {
  return function(req, res) {
    fileCategoryModel.getOne('id', req.params.itemId, function(result){
      fileCategoryModel.getOne('parent_category_id', result[0].id, function(results){
        if(results.length > 0){
          //category_id: req.params.itemId
          // 尚有子分類
          res.json({result: 0})
        }else{
          fileModel.getOne('category_id', result[0].id, function(file_results){
            if(results.length > 0){
              // 該分類尚有圖片
              res.json({result: 0})
            }else{
              fileCategoryModel.deleteOne('id', result[0].id, function(result){
                // 刪除成功。
                res.json({result: 1})
              })
            }
          })
        }

      })
    })
  }
}

// 送出更新的資料：排序更新
exports.image_categories_sort_update = function(options){
  return function(req, res){
    var data_array = JSON.parse(req.body.send_data)
    data_array.forEach(function(item, index) {
      //console.log(item + ' ' + index);

      var update_obj = { "sort_index": index }
      var where_obj = { "id": item }
      fileCategoryModel.update(update_obj, where_obj, false, function(){
        if(data_array.length == index + 1){
          res.json({result: 1})
        }
      })

    })
  }
}
*/
