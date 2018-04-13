var CONFIG = require('../../config/global.js')
var userModel = require(CONFIG.path.models + '/user.js')
var fileModel = require(CONFIG.path.models + '/file.js')
var fileCategoryModel = require(CONFIG.path.models + '/file_category.js')
var functions = require(CONFIG.path.helpers + '/functions.js')

exports.image_categories = function(options) {
  return function(req, res) {

    var sort_obj = { "column": "id", "sort_type": "DESC" }
    fileCategoryModel.getAll(sort_obj, function(results){
      // 找到 level 的最大值
      var level_max = 1
      results.forEach(function(element, index, arr) {
        if(element.level > level_max){
          level_max = element.level
        }
      })

      var all_arrays = []
      var all_arrays_sort = []
      for(var i = 1; i <= level_max; i++){
        all_arrays.push([])
        all_arrays_sort.push([])
      }

      for(var i = 1; i <= level_max; i++){
        results.forEach(function(element, index, arr) {
          if(element.level == i){
            all_arrays[element.level-1].push(element)
          }
        })
      }

      all_arrays.forEach(function(element, index, arr) {
        var all_parents_category = [];
        element.forEach(function(category, category_index, category_arr) {
          if( all_parents_category.indexOf(category.parent_category_id) == -1 ){
            all_parents_category.push(category.parent_category_id)
          }
        })

        all_parents_category.forEach(function(category_id, category_index, category_arr) {

          var the_same_parent_category = []
          results.forEach(function(result_obj, results_index, results_original_arr) {
            if(category_id == result_obj.parent_category_id){
              the_same_parent_category.push(result_obj)
            }
          })
          // sort by value：依小至大
          the_same_parent_category.sort(function (a, b) {
            return a.sort_index - b.sort_index;
          });

          the_same_parent_category.forEach(function(the_category, the_index, ori_categories){
            all_arrays_sort[index].push(the_category)
          })

          if(index + 1 == all_arrays.length && category_index + 1 == all_parents_category.length){
            res.render('admin/image/categories/image_categories', {all_arrays: all_arrays_sort, csrfToken: req.csrfToken()})
          }

        })

      })
    })

  }
}

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
        sort_index: 0,
        show_index: req.body.show_index ? 1 : 0
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
        parent_category_id: req.body.parent_category_id,
        show_index: req.body.show_index ? 1 : 0
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
