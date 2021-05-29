var formidable = require('formidable')
var async = require("async");
var CONFIG = require('../config/global.js')
var announcementModel = require(CONFIG.path.models + '/announcement.js')
var fileModel = require(CONFIG.path.models + '/file.js')
var fileCarouselModel = require(CONFIG.path.models + '/file_carousel.js')
var fileCategoryModel = require(CONFIG.path.models + '/file_category.js')
var organizationModel = require(CONFIG.path.models + '/organization.js')
var fileLikeModel = require(CONFIG.path.models + '/file_like.js')
const settingModel = require(CONFIG.path.models + '/setting.js')
//var userModel = require(CONFIG.path.models + '/user.js')
var functions = require(CONFIG.path.helpers + '/functions.js')

// CONFIG.appenv.storage.scp.user + ':' + CONFIG.appenv.storage.scp.password + '@' + CONFIG.appenv.storage.scp.ip

exports.index = function(options) {
  return function(req, res) {

    fileLikeModel.count_column({ name: 'file_id', alias: 'file_id_total', sort_value: 'DESC' }, function(files_like){

      async.parallel([

        // results[0]: 公告列表
        function(callback) {
          announcementModel.getAllWhere({ column: 'sort_index', sort_type: 'ASC' }, { column_name: 'is_draft', operator: '=', column_value: 0 }, function(announcement_results){
            callback(null, announcement_results);
          })
        },

        // results[1]: 首頁輪播 → 手動挑圖
        function(callback){
          fileCarouselModel.getAll({column: 'sort_index', sort_type: 'ASC'}, function(files_carousel_result){
            let file_ids = [];
            files_carousel_result.forEach((item, i) => {
              file_ids.push(item.file_id);
            });
            let file_ids_str = file_ids.join(",");

            if(file_ids_str.length > 0){
              fileModel.getAllWhere({ column: 'created_at', sort_type: 'DESC' }, { column_name: 'id', operator: 'IN', column_value: `(${file_ids_str})` }, function(carousel_files){
                callback(null, carousel_files);
              })
            }else{
              callback(null, [])
            }
          });
        },

        // results[2]: 公開的圖片總數
        function(callback){
          fileModel.getAll2WhereLimitCOUNT({ column: 'created_at', sort_type: 'DESC' }, { column_name: 'deleted_at', operator: '', column_value: 'IS NULL' }, { column_name: 'permissions', operator: '=', column_value: '1' }, function(files_total_count){
            callback(null, files_total_count[0].total_count)
          });
        },

        // results[3]: 分類圖片
        function(callback){

          fileCategoryModel.getAllWhere({ column: 'level', sort_type: 'ASC' }, { column_name: 'show_index', operator: '=', column_value: 1 }, function(categories){

            let category_ids = [];
            categories.forEach((item, i) => {
              category_ids.push(item.id);
            });
            let category_ids_str = category_ids.join(",");

            if(category_ids_str.length > 0){
              fileModel.getAll2Where({ column: 'created_at', sort_type: 'DESC' }, { column_name: 'deleted_at', operator: '', column_value: 'IS NULL' }, { column_name: 'category_id', operator: 'IN', column_value: `(${category_ids_str})` }, function(category_files){

                categories.forEach(function(category_item, category_index){
                  categories[category_index].files = []
                })

                category_files.forEach(function(file_item, file_index){

                  // 替檔案加上按讚數
                  category_files[file_index].like_num = 0
                  files_like.forEach(function(like_item, like_index){
                    if(file_item.id == like_item.file_id){
                      category_files[file_index].like_num = like_item.file_id_total
                    }
                  });

                  // 替檔案加進某個分類
                  if(file_item.permissions == '1' && file_item.file_type == '1'){
                    categories.forEach(function(category_item, category_index){
                      if(category_item.id == file_item.category_id){
                        if(categories[category_index].files.length < 4){
                          categories[category_index].files.push(file_item)
                        }
                      }
                    });
                  }

                });

                callback(null, categories);
              })
            }else{
              callback(null, []);
            }
          });

        },

        // results[4]: 組織圖片
        function(callback){
          organizationModel.getAllWhere({ column: 'sort_index', sort_type: 'ASC' }, { column_name: 'show_index', operator: '=', column_value: 1 }, function(organizations){

            let organization_ids = [];
            organizations.forEach((item, i) => {
              organization_ids.push("'" + item.organ_id + "'");
            });
            let organization_ids_str = organization_ids.join(",");

            if(organization_ids_str.length > 0){
              fileModel.getAll2Where({ column: 'created_at', sort_type: 'DESC' }, { column_name: 'deleted_at', operator: '', column_value: 'IS NULL' }, { column_name: 'organ_id', operator: 'IN', column_value: `(${organization_ids_str})` }, function(organization_files){

                organizations.forEach(function(organization_item, organization_index){
                  organizations[organization_index].files = []
                })

                organization_files.forEach(function(file_item, file_index){

                  // 替檔案加上按讚數
                  organization_files[file_index].like_num = 0
                  files_like.forEach(function(like_item, like_index){
                    if(file_item.id == like_item.file_id){
                      organization_files[file_index].like_num = like_item.file_id_total
                    }
                  });

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
                callback(null, organizations);
              });

            }else{
              callback(null, []);
            }

          });

        },

        // results[5]: 瀏覽量最高的圖片
        function(callback){
          fileModel.getAll2WhereLimit({ column: 'pageviews', sort_type: 'DESC' }, { column_name: 'deleted_at', operator: '', column_value: 'IS NULL' }, { column_name: 'permissions', operator: '=', column_value: '1' }, [0, 4], function(files_pageviews){

            // 按讚最高 files_pageviews
            files_pageviews.forEach(function(file_item, file_index){
              files_pageviews[file_index].like_num = 0
              files_like.forEach(function(like_item, like_index){
                if(file_item.id == like_item.file_id){
                  files_pageviews[file_index].like_num = like_item.file_id_total
                }
              })
            })

            callback(null, files_pageviews);
          });

        },

        // results[6]: 最新 4 張圖片
        function(callback){
          fileModel.getAll2WhereLimit({ column: 'created_at', sort_type: 'DESC' }, { column_name: 'deleted_at', operator: '', column_value: 'IS NULL' }, { column_name: 'permissions', operator: '=', column_value: '1' }, [0, 4], function(newest_files){

            newest_files.forEach(function(file_item, file_index){
              newest_files[file_index].like_num = 0
              files_like.forEach(function(like_item, like_index){
                if(file_item.id == like_item.file_id){
                  newest_files[file_index].like_num = like_item.file_id_total
                }
              });
            });

            callback(null, newest_files);
          });
        },

        // results[7]: 按讚最高的 4 張圖片
        function(callback){
          let files_like_copy = files_like.slice();

          files_like_copy.sort(function(a, b){ // 由大到小排序
            return -(a.file_id_total - b.file_id_total);
          });
          // 取前四個
          let file_like_most = [];
          files_like_copy.forEach(function(item, i){
            file_like_most.push(item.file_id);
          });
          let file_like_most_str = file_like_most.join(",");

          if(file_like_most_str.length > 0){
            fileModel.getAllWhere({ column: 'created_at', sort_type: 'DESC' }, { column_name: 'id', operator: 'IN', column_value: `(${file_like_most_str})` }, function(like_most_files){

              like_most_files.forEach(function(file_item, file_index){
                like_most_files[file_index].like_num = 0
                files_like.forEach(function(like_item, like_index){
                  if(file_item.id == like_item.file_id){
                    like_most_files[file_index].like_num = like_item.file_id_total
                  }
                });
              });
              callback(null, like_most_files);
            })
          }else{
            callback(null, []);
          }

        },

        // results[8]: 輪播設定
        function(callback){
          settingModel.getAll({ column: "id", sort_type: "DESC" }, function(settings_result){
            let carousel_setting_data = ''
            settings_result.forEach(function(setting_item, setting_index){
              if(setting_item.option_name == "carousel_setting"){
                carousel_setting_data = JSON.parse(setting_item.option_value)
              }
            })
            callback(null, carousel_setting_data);
          });
        },

        // results[9]: 系統挑圖
        function(callback){

          fileModel.getAll2Where({ column: 'created_at', sort_type: 'DESC' }, { column_name: 'deleted_at', operator: '', column_value: 'IS NULL' }, { column_name: 'permissions', operator: '=', column_value: '1' }, function(files){

            settingModel.getAll({ column: "id", sort_type: "DESC" }, function(settings_result){

              let carousel_setting_data = ''
              settings_result.forEach(function(setting_item, setting_index){
                if(setting_item.option_name == "carousel_setting"){
                  carousel_setting_data = JSON.parse(setting_item.option_value)
                }
              })

              let carousels_system_files_array_hot = [] // 系統挑圖：熱門
              let carousels_system_files_array_public = [] // 系統挑圖：最新公開
              if(carousel_setting_data !== ''){
                let return_obj = functions.get_slide_from_system(carousel_setting_data, files, files_like)
                carousels_system_files_array_hot = return_obj.hot_files
                carousels_system_files_array_public = return_obj.public_files
              }

              callback(null, [carousels_system_files_array_hot, carousels_system_files_array_public]);
            });
          });

        }

      ], function(err, results) {
        // results: ['one','two']
        if (err) throw err
        //console.log(results);
        // let announcement_results = results[0];
        // let carousel_files_array = results[1];
        // let files_total_count = results[2];
        // let categories = results[3];
        // let organizations = results[4];
        // let files_pageviews = results[5];
        // let newest_files = results[6];
        // let files_like_total = results[7];
        // let carousel_setting_data = results[8];
        // let carousels_system_files_array_hot = results[9][0];
        // let carousels_system_files_array_public = results[9][1];

        res.render('frontend/index', {
          //all_files: files,
          files_total_count: results[2],
          csrfToken: req.csrfToken(),
          announcement_results: results[0],
          carousel_setting_data: results[8],
          carousels: results[1],
          carousels_system_files_array_hot: results[9][0],
          carousels_system_files_array_public: results[9][1],
          newest_files: results[6],
          categories: results[3],
          organizations: results[4],
          pageviews_highest_files: results[5],
          files_like_total: results[7],
          //client_ip: '1.1.1.1'
          client_ip: req.headers['x-forwarded-for'] || req.ip
        });

      });

    })

  }
}
