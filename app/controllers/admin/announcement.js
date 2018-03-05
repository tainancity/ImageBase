var CONFIG = require('../../config/global.js')
var announcementModel = require(CONFIG.path.models + '/announcement.js')
//var functions = require(CONFIG.path.helpers + '/functions.js')

exports.announcement_list = function(options){
  return function(req, res){
    var sort_obj = { "column": "sort_index", "sort_type": "DESC" }
    var where_obj = { "column_name": "deleted_at", "operator": "!=", "column_value": "''" }
    announcementModel.getAllWhere(sort_obj, where_obj, function(results){
      console.log(results.length)
      res.render('admin/management/announcements/announcement_list', {results: results})
    })

  }
}

exports.announcement_add = function(options){
  return function(req, res){
    res.render('admin/management/announcements/announcement_add', { csrfToken: req.csrfToken() })
  }
}

exports.announcement_add_post = function(options){
  return function(req, res){
    var insert_obj = {
      "title": req.body.title,
      "contents": req.body.contents,
      "is_only_link": req.body.is_only_link,
      "is_draft": req.body.is_draft,
      "sort_index": 0
    }
    announcementModel.save(insert_obj, function(){})
    res.redirect('/admin/management/announcement_add')
    //res.render('admin/management/announcements/announcement_add')
  }
}
