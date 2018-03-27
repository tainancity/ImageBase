var CONFIG = require('../../config/global.js')
var userModel = require(CONFIG.path.models + '/user.js')
var fileModel = require(CONFIG.path.models + '/file.js')
var fileCategoryModel = require(CONFIG.path.models + '/file_category.js')
var organizationModel = require(CONFIG.path.models + '/organization.js')
var tagModel = require(CONFIG.path.models + '/tag.js')
var fileTagModel = require(CONFIG.path.models + '/file_tag.js')
var functions = require(CONFIG.path.helpers + '/functions.js')

// 檔案列表
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

          tagModel.getAll({column: 'id', sort_type: 'DESC'}, function(all_tags){
            //console.log(all_tags)
            fileTagModel.getAll({column: 'id', sort_type: 'DESC'}, function(files_tags_result){
              //console.log(files_tags_result)

              fileModel.getAllWhere(sort_obj, where_obj, function(files){

                if(files.length == 0){
                  return res.render('admin/image/files/list', {files: [], show_uploader_and_organ: show_uploader_and_organ})
                }
                
                files.forEach(function(item, index) {
                  var file_tags_arr = []
                  files_tags_result.forEach(function(tags_result_item, tags_result_index){
                    all_tags.forEach(function(the_tag, tag_index){
                      if(tags_result_item.file_id == item.id && tags_result_item.tag_id == the_tag.id){
                        file_tags_arr.push(the_tag.tag_name)
                      }
                    })
                  })
                  item.tags = file_tags_arr

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
      })
    })

  }
}

// 檔案上傳
exports.file_upload = function(options) {
  return function(req, res) {
    res.render('admin/image/files/upload')
  }
}
