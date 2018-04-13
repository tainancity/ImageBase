var formidable = require('formidable')
var fs = require('fs')
var util = require('util')

var CONFIG = require('../config/global.js')
var announcementModel = require(CONFIG.path.models + '/announcement.js')
var fileModel = require(CONFIG.path.models + '/file.js')
var fileCarouselModel = require(CONFIG.path.models + '/file_carousel.js')
var fileCategoryModel = require(CONFIG.path.models + '/file_category.js')
//var userModel = require(CONFIG.path.models + '/user.js')
//var functions = require(CONFIG.path.helpers + '/functions.js')

// CONFIG.appenv.storage.scp.user + ':' + CONFIG.appenv.storage.scp.password + '@' + CONFIG.appenv.storage.scp.ip

exports.index = function(options) {
  return function(req, res) {
    announcementModel.getAllWhere({ column: 'sort_index', sort_type: 'ASC' }, { column_name: 'is_draft', operator: '=', column_value: 0 }, function(announcement_results){


      fileCarouselModel.getAll({column: 'sort_index', sort_type: 'ASC'}, function(files_carousel_result){

        fileModel.getAllWhere({ column: 'created_at', sort_type: 'DESC' }, { column_name: 'deleted_at', operator: '', column_value: 'IS NULL' }, function(files){

          fileCategoryModel.getAllWhere({ column: 'level', sort_type: 'ASC' }, { column_name: 'show_index', operator: '=', column_value: 1 }, function(categories){

            // 輪播
            carousel_files_array = []
            files_carousel_result.forEach(function(carousel_item, carousel_index){
              files.forEach(function(file_item, file_index){
                if(carousel_item.file_id == file_item.id){
                  carousel_files_array.push(file_item)
                }
              })
            })

            // 最新圖片
            var newest_files = []
            files.forEach(function(file_item, file_index){
              if(file_index <= 3){
                if(file_item.permissions == '1' && file_item.file_type == '1'){
                  newest_files.push(file_item)
                }
              }
            })

            // 分類圖片
            //console.log(categories)
            categories.forEach(function(category_item, category_index){
              categories[category_index].files = []
            })
            files.forEach(function(file_item, file_index){
              categories.forEach(function(category_item, category_index){
                if(category_item.id == file_item.category_id){
                  categories[category_index].files.push(file_item)
                }
              })
            })

            res.render('frontend/index', {announcement_results: announcement_results, carousels: carousel_files_array, newest_files: newest_files, categories: categories})

          })

        })

      })

    })
  }
}
