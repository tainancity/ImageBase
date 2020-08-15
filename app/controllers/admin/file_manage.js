var CONFIG = require('../../config/global.js')
var userModel = require(CONFIG.path.models + '/user.js')
var fileModel = require(CONFIG.path.models + '/file.js')
var fileCategoryModel = require(CONFIG.path.models + '/file_category.js')
var organizationModel = require(CONFIG.path.models + '/organization.js')
var tagModel = require(CONFIG.path.models + '/tag.js')
var fileTagModel = require(CONFIG.path.models + '/file_tag.js')
var fileCarouselModel = require(CONFIG.path.models + '/file_carousel.js')
var fileLikeModel = require(CONFIG.path.models + '/file_like.js')
var functions = require(CONFIG.path.helpers + '/functions.js')
const settingModel = require(CONFIG.path.models + '/setting.js')

// 檔案列表
exports.file_list = function(options) {
  return function(req, res) {
    var c_page = parseInt(req.query.page)
    var items_per_page = 20
    if(c_page == undefined || !Number.isInteger(c_page)){
      c_page = 1;
    }

    // csrfToken: req.csrfToken()
    var show_uploader_and_organ = false
    if( (req.originalUrl).includes('/admin/management/file/list') || (req.originalUrl).includes('/admin/organization/file/list') ){
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
              fileCarouselModel.getAll({column: 'id', sort_type: 'DESC'}, function(files_carousel_result){

                fileModel.getAllWhere(sort_obj, where_obj, function(files){

                  fileLikeModel.getAll({column: 'id', sort_type: 'DESC'}, function(files_like_result){
                    //console.log(files_like_result);

                    var carousel_arr = []
                    files_carousel_result.forEach(function(carousel_item, carousel_index){
                      carousel_arr.push(carousel_item.file_id)
                    })

                    if(files.length == 0){
                      return res.render('admin/image/files/list', {files: [], show_uploader_and_organ: show_uploader_and_organ, carousels: carousel_arr, csrfToken: req.csrfToken()})
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

                      item.like_num = 0;
                      files_like_result.forEach(function(file_like_item, file_like_index){
                        if(item.id == file_like_item.file_id){
                          item.like_num += 1
                        }
                      })

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
                                var total_pages = Math.ceil(files.length / items_per_page)
                                files = files.slice((c_page-1) * items_per_page, c_page * items_per_page);
                                res.render('admin/image/files/list', {files: files, total_pages: total_pages, c_page: c_page, show_uploader_and_organ: show_uploader_and_organ, carousels: carousel_arr, csrfToken: req.csrfToken()})
                              }
                            })
                          })
                        }else{ // 平台管理者、局處理者者

                          userModel.getOne('u_id', req.session.u_id, function(user_results){
                            //console.log("here: " + user_results[0].role_id)
                            if(user_results[0].role_id == 3){ // 局處管理者

                              let show_files = []
                              files.forEach(function(each_files_item, each_files_index){
                                if(each_files_item.organ_id == user_results[0].organ_id){
                                  //files.splice(each_files_index, 1)
                                  show_files.push(each_files_item)
                                }
                              })

                              var total_pages = Math.ceil(show_files.length / items_per_page)
                              show_files = show_files.slice((c_page-1) * items_per_page, c_page * items_per_page);
                              res.render('admin/image/files/list', {files: show_files, total_pages: total_pages, c_page: c_page, show_uploader_and_organ: show_uploader_and_organ, carousels: carousel_arr, csrfToken: req.csrfToken()})

                            }else if(user_results[0].role_id == 1){ // 平台管理者
                              var total_pages = Math.ceil(files.length / items_per_page)
                              files = files.slice((c_page-1) * items_per_page, c_page * items_per_page);
                              res.render('admin/image/files/list', {files: files, total_pages: total_pages, c_page: c_page, show_uploader_and_organ: show_uploader_and_organ, carousels: carousel_arr, csrfToken: req.csrfToken()})
                            }else{

                            }
                          })


                        }
                      }

                    })

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

// 首頁輪播列表
exports.file_carousel_list = function(options) {
  return function(req, res) {
    // csrfToken: req.csrfToken()

    fileCarouselModel.getAll({column: 'sort_index', sort_type: 'ASC'}, function(files_carousel_result){

      fileModel.getAllWhere({ column: "created_at", sort_type: "DESC" }, { column_name: "deleted_at", operator: "", column_value: 'IS NULL' }, function(files){

        settingModel.getAll({ column: "id", sort_type: "DESC" }, function(settings_result){

          fileLikeModel.getAll({column: 'id', sort_type: 'DESC'}, function(files_like_result){


            let carousel_setting_data = ''
            settings_result.forEach(function(setting_item, setting_index){
              if(setting_item.option_name == "carousel_setting"){
                carousel_setting_data = JSON.parse(setting_item.option_value)
              }
            })

            let carousels_system_files_array_hot = [] // 系統挑圖：熱門
            let carousels_system_files_array_public = [] // 系統挑圖：最新公開
            if(carousel_setting_data !== ''){
              let return_obj = functions.get_slide_from_system(carousel_setting_data, files, files_like_result)
              carousels_system_files_array_hot = return_obj.hot_files
              carousels_system_files_array_public = return_obj.public_files
            }


            let carousel_files_array = [] // 手動挑圖
            files_carousel_result.forEach(function(carousel_item, carousel_index){
              files.forEach(function(file_item, file_index){
                if(carousel_item.file_id == file_item.id){
                  carousel_files_array.push(file_item)
                }
              })
            })

            res.render('admin/image/files/carousel', {carousels: carousel_files_array, carousels_system_hot: carousels_system_files_array_hot, carousels_system_public: carousels_system_files_array_public, carousel_setting: carousel_setting_data, csrfToken: req.csrfToken()})


          })


        })

      })

    })

  }
}

// 首頁輪播列表：系統挑圖的設定
exports.file_carousel_list_setting = function(options) {
  return function(req, res) {
    // csrfToken: req.csrfToken()
    let carousel_setting = {
      hot_threshold: req.body.hot_threshold,
      slide_number: req.body.slide_number,
      slide_number_ratio: req.body.slide_number_ratio,
      slide_priority: req.body.slide_priority
    }
    //console.log(carousel_setting)

    settingModel.getAll({"column": "id", "sort_type": "DESC"}, function(results){

      let has_carousel_setting = false
      results.forEach(function(entry) {
        if(entry.option_name == 'carousel_setting'){
          has_carousel_setting = true
        }
      })

      if(has_carousel_setting){ // 更新
        let update_obj = {"option_value": JSON.stringify(carousel_setting)}
        let where_obj = {"option_name": "carousel_setting"}
        settingModel.update(update_obj, where_obj, true, function(){
          res.redirect('/admin/management/file/carousel')
        })
      }else{ // 新增
        let insert_obj = {
          "option_name": "carousel_setting",
          "option_value": JSON.stringify(carousel_setting)
        }
        settingModel.save(insert_obj, false, function(){
          res.redirect('/admin/management/file/carousel')
        })
      }

    })

  }
}

// 檔案編輯
exports.file_update = function(options) {
  return function(req, res) {
    fileModel.getOne('u_id', req.params.u_id, function(result){
      if(result.length > 0){
        userModel.getOne('u_id', req.session.u_id, function(user_result){
          if(result[0].user_id == user_result[0].id){
            var origin_file
            JSON.parse(result[0].file_data).forEach(function(file_item, file_index){

              if(file_item.origin){
                origin_file = file_item
              }
              /*if(file_item.width == 960){
                origin_file = file_item
              }*/

            })

            fileCategoryModel.getAll({column: 'id', sort_type: 'DESC'}, function(all_categories){
              // 取得 tags
              tagModel.getAll({column: 'id', sort_type: 'DESC'}, function(all_tags_result){
                var sort_obj = { column: 'id', sort_type: 'DESC' }
                var where_obj = { column_name: 'file_id', operator: '=', column_value: result[0].id }
                fileTagModel.getAllWhere(sort_obj, where_obj, function(file_tags){
                  var file_tags_arr = []
                  file_tags.forEach(function(item_tag, item_index){
                    all_tags_result.forEach(function(the_tag, the_tag_index){
                      if(item_tag.tag_id == the_tag.id){
                        file_tags_arr.push(the_tag.tag_name)
                      }
                    })
                  })
                  res.render('admin/image/files/update', {u_id: req.params.u_id, file: result[0], file_tags: file_tags_arr, categories: all_categories, origin_file: origin_file})
                })
              })
            })

          }else{
            res.render('admin/image/files/update', {u_id: req.params.u_id, no_privilege: true})
          }
        })
      }else{
        res.render('admin/image/files/update', {u_id: req.params.u_id, no_file: true})
      }
    })
  }
}

// 檔案上傳
exports.file_upload = function(options) {
  return function(req, res) {
    res.render('admin/image/files/upload')
  }
}

// 檔案列表：垃圾桶
exports.file_list_trash = function(options) {
  return function(req, res) {
    // csrfToken: req.csrfToken()
    var show_uploader_and_organ = false
    if(req.originalUrl == '/admin/management/file/trash' || req.originalUrl == '/admin/organization/file/trash'){
      var show_uploader_and_organ = true
    }

    var sort_obj = { column: "deleted_at", sort_type: "DESC" }
    var where_obj = { column_name: "deleted_at", operator: "", column_value: 'IS NOT NULL' }
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

                fileLikeModel.getAll({column: 'id', sort_type: 'DESC'}, function(files_like_result){

                  if(files.length == 0){
                    return res.render('admin/image/files/trash', {files: [], show_uploader_and_organ: show_uploader_and_organ})
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

                    item.like_num = 0;
                    files_like_result.forEach(function(file_like_item, file_like_index){
                      if(item.id == file_like_item.file_id){
                        item.like_num += 1
                      }
                    })

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
                              res.render('admin/image/files/trash', {files: files, show_uploader_and_organ: show_uploader_and_organ})
                            }
                          })
                        })
                      }else{ // 管理者

                        userModel.getOne('u_id', req.session.u_id, function(user_results){
                          //console.log("here: " + user_results[0].role_id)
                          if(user_results[0].role_id == 3){ // 局處管理者

                            let show_files = []
                            files.forEach(function(each_files_item, each_files_index){
                              if(each_files_item.organ_id == user_results[0].organ_id){
                                //files.splice(each_files_index, 1)
                                show_files.push(each_files_item)
                              }
                            })

                            res.render('admin/image/files/trash', {files: show_files, show_uploader_and_organ: show_uploader_and_organ})

                          }else if(user_results[0].role_id == 1){ // 平台管理者

                            res.render('admin/image/files/trash', {files: files, show_uploader_and_organ: show_uploader_and_organ})
                          }else{

                          }
                        })


                      }
                    }

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


// 權限移轉
exports.file_transfer = function(options) {
  return function(req, res) {
    res.render('admin/image/files/transfer', {csrfToken: req.csrfToken()})
  }
}


// 送出更新的資料：排序更新
exports.file_carousel_sort_update = function(options){
  return function(req, res){
    var data_array = JSON.parse(req.body.send_data)
    data_array.forEach(function(item, index) {
      //console.log(item + ' ' + index);

      var update_obj = { "sort_index": index }
      var where_obj = { "file_id": item }
      fileCarouselModel.update(update_obj, where_obj, false, function(){
        if(data_array.length == index + 1){
          res.json({result: 1})
        }
      })

    })
  }
}

// 檔案下載
exports.file_download = function(options) {
  return function(req, res) {
    organizationModel.getAll({column: 'id', sort_type: 'ASC'}, function(all_organs){

      res.render('admin/image/files/download', {
        organs: all_organs,
        csrfToken: req.csrfToken()
      })
      
    })

  }
}
