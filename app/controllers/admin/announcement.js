var CONFIG = require('../../config/global.js')
var announcementModel = require(CONFIG.path.models + '/announcement.js')
//var functions = require(CONFIG.path.helpers + '/functions.js')

// 列表
exports.announcement_list = function(options){
  return function(req, res){
    var sort_obj = { "column": "sort_index", "sort_type": "ASC" }
    //var where_obj = { "column_name": "deleted_at", "operator": "", "column_value": "IS NULL" }
    //var where_obj = { "column_name": "is_draft", "operator": "=", "column_value": "0" }
    announcementModel.getAll(sort_obj, function(results){
      //console.log(results.length)
      res.render('admin/management/announcements/announcement_list', {results: results, csrfToken: req.csrfToken()})
    })

  }
}

// 新增
exports.announcement_add = function(options){
  return function(req, res){
    res.render('admin/management/announcements/announcement_add', { csrfToken: req.csrfToken() })
  }
}

// 送出新增的資料
exports.announcement_add_post = function(options){
  return function(req, res){
    var insert_obj = {
      "title": req.body.title,
      "contents": req.body.contents,
      "is_only_link": req.body.is_only_link,
      "is_draft": req.body.is_draft,
      "sort_index": 0
    }
    announcementModel.save(insert_obj, function(){
      res.redirect('/admin/management/announcement_list')
    })
  }
}

// 編輯
exports.announcement_edit = function(options){
  return function(req, res){
    announcementModel.getOne('id', req.params.itemId, function(result){
      if(result.length == 0){
        res.redirect('/admin/management/announcement_list')
      }
      res.render('admin/management/announcements/announcement_edit', { result: result[0], csrfToken: req.csrfToken() })
    })
  }
}

// 送出更新的資料
exports.announcement_edit_post = function(options){
  return function(req, res){
    var update_obj = {
      "title": req.body.title,
      "contents": req.body.contents,
      "is_only_link": req.body.is_only_link,
      "is_draft": req.body.is_draft
    }
    var where_obj = {
      "id": req.body.id
    }
    announcementModel.update(update_obj, where_obj, function(){
      res.redirect('/admin/management/announcement_edit/' + req.body.id)
    })
  }
}

// 刪除公告
exports.announcement_delete = function(options){
  return function(req, res){
    announcementModel.deleteOne('id', req.body.item_id, function(){
      res.json({result: 1})
    })
  }
}

// 送出更新的資料：排序更新
exports.announcements_sort_update = function(options){
  return function(req, res){
    var data_array = JSON.parse(req.body.send_data)
    data_array.forEach(function(item, index) {
      //console.log(item + ' ' + index);

      var update_obj = { "sort_index": index }
      var where_obj = { "id": item }
      announcementModel.update(update_obj, where_obj, function(){
        if(data_array.length == index + 1){
          res.json({result: 1})
        }
      })

    });
  }
}
