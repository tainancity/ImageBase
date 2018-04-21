var formidable = require('formidable')
var fs = require('fs')
var util = require('util')

var CONFIG = require('../config/global.js')
var announcementModel = require(CONFIG.path.models + '/announcement.js')
var fileModel = require(CONFIG.path.models + '/file.js')
var fileCarouselModel = require(CONFIG.path.models + '/file_carousel.js')
var fileCategoryModel = require(CONFIG.path.models + '/file_category.js')
var organizationModel = require(CONFIG.path.models + '/organization.js')
var fileLikeModel = require(CONFIG.path.models + '/file_like.js')
//var userModel = require(CONFIG.path.models + '/user.js')
//var functions = require(CONFIG.path.helpers + '/functions.js')

// CONFIG.appenv.storage.scp.user + ':' + CONFIG.appenv.storage.scp.password + '@' + CONFIG.appenv.storage.scp.ip

exports.index = function(options) {
  return function(req, res) {
    announcementModel.getAllWhere({ column: 'sort_index', sort_type: 'ASC' }, { column_name: 'is_draft', operator: '=', column_value: 0 }, function(announcement_results){


      fileCarouselModel.getAll({column: 'sort_index', sort_type: 'ASC'}, function(files_carousel_result){

        fileModel.getAllWhere({ column: 'created_at', sort_type: 'DESC' }, { column_name: 'deleted_at', operator: '', column_value: 'IS NULL' }, function(files){

          fileCategoryModel.getAllWhere({ column: 'level', sort_type: 'ASC' }, { column_name: 'show_index', operator: '=', column_value: 1 }, function(categories){

            organizationModel.getAllWhere({ column: 'sort_index', sort_type: 'ASC' }, { column_name: 'show_index', operator: '=', column_value: 1 }, function(organizations){

              fileModel.getAllWhere({ column: 'pageviews', sort_type: 'ASC' }, { column_name: 'deleted_at', operator: '', column_value: 'IS NULL' }, function(files_pageviews){

                fileLikeModel.count_column({ name: 'file_id', alias: 'file_id_total', sort_value: 'DESC' }, function(files_like){

                  // 輪播
                  carousel_files_array = []
                  files_carousel_result.forEach(function(carousel_item, carousel_index){
                    files.forEach(function(file_item, file_index){
                      if(carousel_item.file_id == file_item.id){
                        carousel_files_array.push(file_item)
                      }
                    })
                  })

                  // 為每個檔案加上按讚數
                  files.forEach(function(file_item, file_index){
                    files[file_index].like_num = 0
                    files_like.forEach(function(like_item, like_index){
                      if(file_item.id == like_item.file_id){
                        files[file_index].like_num = like_item.file_id_total
                      }
                    })
                  })
                  files_pageviews.forEach(function(file_item, file_index){
                    files_pageviews[file_index].like_num = 0
                    files_like.forEach(function(like_item, like_index){
                      if(file_item.id == like_item.file_id){
                        files_pageviews[file_index].like_num = like_item.file_id_total
                      }
                    })
                  })

                  // 最新圖片的前 4 個
                  var newest_files = []
                  files.forEach(function(file_item, file_index){
                    if(newest_files.length < 4){
                      if(file_item.permissions == '1' && file_item.file_type == '1'){
                        newest_files.push(file_item)
                      }
                    }
                  })


                  // 瀏覽量最高前 4 個
                  var pageviews_highest_files = []
                  files_pageviews.forEach(function(file_item, file_index){
                    if(pageviews_highest_files.length < 4){
                      if(file_item.permissions == '1' && file_item.file_type == '1'){
                        pageviews_highest_files.push(file_item)
                      }
                    }
                  })


                  // 按讚最高 files_like
                  var files_like_total = []
                  files_like.forEach(function(file_like_item, file_like_index){
                    files.forEach(function(file_item, file_index){
                      if(file_like_item.file_id == file_item.id){
                        if(file_item.permissions == '1' && file_item.file_type == '1'){
                          if(files_like_total.length < 4){
                            files_like_total.push(file_item)
                          }
                        }
                      }
                    })
                  })


                  // 分類圖片
                  //console.log(categories)
                  categories.forEach(function(category_item, category_index){
                    categories[category_index].files = []
                  })
                  files.forEach(function(file_item, file_index){
                    if(file_item.permissions == '1' && file_item.file_type == '1'){
                      categories.forEach(function(category_item, category_index){
                        if(category_item.id == file_item.category_id){
                          if(categories[category_index].files.length < 4){
                            categories[category_index].files.push(file_item)
                          }
                        }
                      })
                    }
                  })

                  // 局處圖片
                  //console.log(organizations)
                  organizations.forEach(function(organization_item, organization_index){
                    organizations[organization_index].files = []
                  })
                  files.forEach(function(file_item, file_index){
                    if(file_item.permissions == '1' && file_item.file_type == '1'){
                      organizations.forEach(function(organization_item, organization_index){
                        if(organization_item.organ_id == file_item.organ_id){
                          if(organizations[organization_index].files.length < 4){
                            organizations[organization_index].files.push(file_item)
                          }
                        }
                      })
                    }
                  })

                  res.render('frontend/index', {
                    csrfToken: req.csrfToken(),
                    announcement_results: announcement_results,
                    carousels: carousel_files_array,
                    newest_files: newest_files,
                    categories: categories,
                    organizations: organizations,
                    pageviews_highest_files: pageviews_highest_files,
                    files_like_total: files_like_total,
                    //client_ip: '1.1.1.1'
                    client_ip: req.headers['x-forwarded-for'] || req.ip
                  })

                })

              })

            })

          })

        })

      })

    })
  }
}
