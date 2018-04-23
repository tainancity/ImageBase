var CONFIG = require('../config/global.js')
var redisInstance = require("redis")
var redisClient = redisInstance.createClient({
  host: CONFIG.appenv.redis.host,
  port: CONFIG.appenv.redis.port,
  password: CONFIG.appenv.redis.password,
  db: 1
})
var fileModel = require(CONFIG.path.models + '/file.js')
var fileCategoryModel = require(CONFIG.path.models + '/file_category.js')
var organizationModel = require(CONFIG.path.models + '/organization.js')
var userModel = require(CONFIG.path.models + '/user.js')
var tagModel = require(CONFIG.path.models + '/tag.js')
var fileTagModel = require(CONFIG.path.models + '/file_tag.js')

var static_func = require(CONFIG.path.helpers + '/static.js')

redisClient.on("error", function (err) {
    console.log("Error " + err)
});

module.exports = {
  import_to_redis: function() {

    fileModel.getAll({ column: 'created_at', sort_type: 'DESC' }, function(all_files_result){
      fileCategoryModel.getAll({ column: 'id', sort_type: 'DESC' }, function(all_categories){
        organizationModel.getAll({ column: 'id', sort_type: 'DESC' }, function(all_organizations){
          userModel.getAll({ column: 'id', sort_type: 'DESC' }, function(all_users){
            tagModel.getAll({ column: 'id', sort_type: 'DESC' }, function(all_tags){
              fileTagModel.getAll({ column: 'id', sort_type: 'DESC' }, function(all_file_tags){

                all_files_result.forEach(function(item, i){

                  var category_name
                  var organization_name
                  var user_name
                  var tag_arr = []
                  all_categories.forEach(function(category_item, category_index){
                    if(item.category_id == category_item.id){
                      category_name = category_item.category_name
                    }
                  })
                  all_organizations.forEach(function(organization_item, organization_index){
                    if(item.organ_id == organization_item.organ_id){
                      organization_name = organization_item.organ_name
                    }
                  })
                  all_users.forEach(function(user_item, user_index){
                    if(item.user_id == user_item.id){
                      user_name = static_func.decrypt(user_item.name)
                    }
                  })
                  all_file_tags.forEach(function(file_tag_item, file_tag_index){
                    if(file_tag_item.file_id == item.id ){
                      all_tags.forEach(function(tag_item, tag_index){
                        if(file_tag_item.tag_id == tag_item.id){
                          tag_arr.push(tag_item.tag_name)
                        }
                      })
                    }
                  })

                  if(item.deleted_at == null){
                    item.deleted_at = ''
                  }
                  if(item.title == null){
                    item.title = ''
                  }

                  //redisClient.hset("foo1", "OK");
                  redisClient.hmset([item.u_id,
                    'title', item.title,
                    'user_id', item.user_id,
                    'user_name', user_name,
                    'category_id', item.category_id,
                    'category_name', category_name,
                    'organ_id', item.organ_id,
                    'organization_name', organization_name,
                    'file_type', item.file_type,
                    'file_path', item.file_path,
                    'file_ext', item.file_ext,
                    'file_data', item.file_data,
                    'pageviews', item.pageviews,
                    'permissions', item.permissions,
                    'tags', tag_arr.join(','),
                    'created_at', item.created_at,
                    'updated_at', item.updated_at,
                    'deleted_at', item.deleted_at
                  ])
                })
                //process.exit()
                //redisClient.quit()

              })
            })
          })
        })
      })
    })

  },

  get_file: function(u_id, cb){
    return redisClient.hgetall(u_id, function (err, obj) {
      if (err) throw err
      //console.log(obj)
      cb(obj)
      //return obj
      //console.log(obj); // Will print `OK`
    })
  }
}


/*
fileModel.getAll({ column: 'created_at', sort_type: 'DESC' }, function(all_files_result){
  fileCategoryModel.getAll({ column: 'id', sort_type: 'DESC' }, function(all_categories){
    organizationModel.getAll({ column: 'id', sort_type: 'DESC' }, function(all_organizations){
      userModel.getAll({ column: 'id', sort_type: 'DESC' }, function(all_users){
        tagModel.getAll({ column: 'id', sort_type: 'DESC' }, function(all_tags){
          fileTagModel.getAll({ column: 'id', sort_type: 'DESC' }, function(all_file_tags){

            all_files_result.forEach(function(item, i){

              var category_name
              var organization_name
              var user_name
              var tag_arr = []
              all_categories.forEach(function(category_item, category_index){
                if(item.category_id == category_item.id){
                  category_name = category_item.category_name
                }
              })
              all_organizations.forEach(function(organization_item, organization_index){
                if(item.organ_id == organization_item.organ_id){
                  organization_name = organization_item.organ_name
                }
              })
              all_users.forEach(function(user_item, user_index){
                if(item.user_id == user_item.id){
                  user_name = static_func.decrypt(user_item.name)
                }
              })
              all_file_tags.forEach(function(file_tag_item, file_tag_index){
                if(file_tag_item.file_id == item.id ){
                  all_tags.forEach(function(tag_item, tag_index){
                    if(file_tag_item.tag_id == tag_item.id){
                      tag_arr.push(tag_item.tag_name)
                    }
                  })
                }
              })

              if(item.deleted_at == null){
                item.deleted_at = ''
              }
              if(item.title == null){
                item.title = ''
              }

              //redisClient.hset("foo1", "OK");
              redisClient.hmset([item.u_id,
                'title', item.title,
                'user_id', item.user_id,
                'user_name', user_name,
                'category_id', item.category_id,
                'category_name', category_name,
                'organ_id', item.organ_id,
                'organization_name', organization_name,
                'file_type', item.file_type,
                'file_path', item.file_path,
                'file_ext', item.file_ext,
                'file_data', item.file_data,
                'pageviews', item.pageviews,
                'permissions', item.permissions,
                'tags', tag_arr.join(','),
                'created_at', item.created_at,
                'updated_at', item.updated_at,
                'deleted_at', item.deleted_at
              ])
            })
            process.exit()
            redisClient.quit()

          })
        })
      })
    })
  })
})
*/

//client.set("string key", "string val", redis.print)
