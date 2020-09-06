var CONFIG = require('../app/config/global.js')
var userModel = require(CONFIG.path.models + '/user.js')
var logLoginModel = require(CONFIG.path.models + '/log_login.js')
var fileCarouselModel = require(CONFIG.path.models + '/file_carousel.js')
var fileModel = require(CONFIG.path.models + '/file.js')
var shortUrlModel = require(CONFIG.path.models + '/short_urls.js')
var fileLikeModel = require(CONFIG.path.models + '/file_like.js')
var fileTransferModel = require(CONFIG.path.models + '/file_transfer.js')
var redisFileDataModel = require(CONFIG.path.redis + '/redis_file_data.js')
var functions = require(CONFIG.path.helpers + '/functions.js')


const fs = require("fs")
const http = require('http')
const async = require("async")
const exec = require('child_process').exec
const AdmZip = require('adm-zip')

let client_ssh = require('ssh2-sftp-client')
let client_ssh_sftp = new client_ssh();

module.exports = function(app){

  var options = {}

  app.group('/api-ajax/v1.0', (app) => {
    app.get('/account-token-auth', function(req, res){
      if(req.query.token == 'local_token'){ // 這裡的意思，表示是本機端開發所傳送的固定 'local_token'
        //let token = req.query.token
        if(req.query.token == 'local_token'){
          res.send("1")
          return
        }
        res.send("2")
      }else if(req.query.token == 'production_token'){
        //let token = req.query.token
        if(req.query.token == 'production_token'){
          res.send("1")
          return
        }
        res.send("2")
      }else{
        logLoginModel.getOne('token', req.query.token, function(results_check){
          if(results_check.length >= 1){
            res.send("1")
          }else{
            res.send("2")
          }
        })
      }
    })

    app.get('/update-role', function(req, res){
      var update_obj = {"role_id": req.query.role}
      var where_obj = {"u_id": req.query.u_id}
      userModel.update(update_obj, where_obj, true, function(result){
        //res.json({"u_id": req.query.u_id, "role_id": req.query.role})
        res.json(result)
      });
    })

    app.get('/update-agreement', function(req, res){
      var update_obj = {"agreement": 1}
      var where_obj = {"u_id": req.session.u_id}
      userModel.update(update_obj, where_obj, true, function(result){
        //res.json({"u_id": req.query.u_id, "role_id": req.query.role})
        res.json(result)
      });
    })

    // 前台輪播
    app.post('/save-carousel', function(req, res){
      fileModel.getOne('u_id', req.body.u_id, function(file_resule){
        if(file_resule.length > 0){
          if(req.body.checked == 'true'){
            fileCarouselModel.save({file_id: file_resule[0].id, sort_index: 0}, false, function(save_result){
              res.json({checked: req.body.checked, u_id: req.body.u_id})
            })
          }else{
            fileCarouselModel.deleteWhere('file_id', file_resule[0].id, function(del_result){
              res.json({checked: req.body.checked, u_id: req.body.u_id})
            })
          }
        }else{
          res.json({result: false})
        }
      })

    })

    // 取得按讚的 ip
    app.get('/like-ip', function(req, res){
      fileLikeModel.getAll({ column: 'id', sort_type: 'ASC' }, function(files_like){
        res.json({result: files_like})
      })
    })

    // 更新按讚的 ip
    app.post('/update-like', function(req, res){
      var client_ip = req.headers['x-forwarded-for'] || req.ip;
      if(req.body.like == 'true'){ // like
        fileLikeModel.getAll2Where({ column: 'id', sort_type: 'DESC' }, { column_name: 'file_id', operator: '=', column_value: req.body.id  }, { column_name: 'ip', operator: '=', column_value: '\'' + client_ip + '\'' }, function(result){
          if(result.length == 0){
            fileLikeModel.save({file_id: req.body.id, ip: client_ip}, false, function(result){

              fileLikeModel.count_column({ name: 'file_id', alias: 'file_id_total', sort_value: 'DESC' }, function(file_like_result){
                file_like_result.forEach(function(like_item, like_index){
                  if(like_item.file_id == req.body.id){
                    res.json({
                      id: req.body.id,
                      like_num: like_item.file_id_total
                      //file_id: req.body.id,
                      //ip: req.headers['x-forwarded-for'] || req.ip
                    })
                  }
                })

              })

            })
          }else{
            fileLikeModel.count_column({ name: 'file_id', alias: 'file_id_total', sort_value: 'DESC' }, function(file_like_result){
              file_like_result.forEach(function(like_item, like_index){
                if(like_item.file_id == req.body.id){
                  res.json({
                    id: req.body.id,
                    like_num: like_item.file_id_total
                    //file_id: req.body.id,
                    //ip: req.headers['x-forwarded-for'] || req.ip
                  })
                }
              })

            })
          }
        })

      }else{ // cancel like
        fileLikeModel.delete2Where('file_id', req.body.id, 'ip', client_ip, function(){

          fileLikeModel.count_column({ name: 'file_id', alias: 'file_id_total', sort_value: 'DESC' }, function(file_like_result){
            var like_num = 0
            file_like_result.forEach(function(like_item, like_index){
              if(like_item.file_id == req.body.id){
                like_num = like_item.file_id_total
              }
            })

            res.json({
              id: req.body.id,
              like_num: like_num
              //file_id: req.body.id,
              //ip: req.headers['x-forwarded-for'] || req.ip
            })

          })

        })
      }


    })

    // 更新瀏覽量
    app.put('/update-pageviews', function(req, res){

      fileModel.getOne('u_id', req.body.u_id, function(file_resule){
        var new_pageviews = file_resule[0].pageviews + 1
        var update_obj = {'pageviews': new_pageviews}
        var where_obj = {'u_id': req.body.u_id}
        fileModel.update(update_obj, where_obj, true, function(result){
          //res.json({"u_id": req.query.u_id, "role_id": req.query.role})
          redisFileDataModel.import_to_redis()
          res.json({new_pageviews:new_pageviews})
        });
      })
    })

    // 刪除短網址
    app.delete('/delete-short-url', function(req, res){
      userModel.getOne('u_id', req.session.u_id, function(user_results){

        if( user_results[0].role_id == 1 ){ // 管理者
          shortUrlModel.deleteWhere('u_id', req.body.u_id, function(results){
            //res.json({result: '1'})
            if(results.affectedRows > 0){
              res.json({delete_result: 1})
            }else{
              res.json({delete_result: 0})
            }
          })
        }else{
          shortUrlModel.delete2Where('user_id', user_results[0].id, 'u_id', req.body.u_id, function(results){
            //res.json({result: '1'})
            if(results.affectedRows > 0){
              res.json({delete_result: 1})
            }else{
              res.json({delete_result: 0})
            }
          })
        }

      });

    })

    // 圖片權限移轉：列表
    app.get('/transfer-files/:account', function(req, res){

      userModel.getOne('u_id', req.session.u_id, function(login_user){

        if(login_user[0].role_id == 1){ // 平台管理者
          userModel.getOne('pid', req.params.account, function(user_results){

            if(user_results.length > 0){

              fileModel.getAllWhere({ "column": "created_at", "sort_type": "DESC" }, { "column_name": "user_id", "operator": "=", "column_value": user_results[0].id }, function(files){
                //console.log(files)
                if(files.length > 0){

                  userModel.getAll({ column: 'created_at', sort_type: 'DESC' }, function(users_result){
                    fileTransferModel.getAll({ column: 'created_at', sort_type: 'DESC' }, function(files_transfer_result){
                      //console.log(files_transfer_result)
                      files.forEach(function(file_item, file_index){
                        files[file_index].transfer_log = []
                        files_transfer_result.forEach(function(transfer_item, transfer_index){

                          let transfer_item_log = {
                            created_at: transfer_item.created_at
                          }
                          users_result.forEach(function(user_item, user_index){
                            if(transfer_item.user_id_from == user_item.id){
                              transfer_item_log.user_from = user_item.pid
                            }
                            if(transfer_item.user_id_to == user_item.id){
                              transfer_item_log.user_to = user_item.pid
                            }
                          })
                          if(file_item.id == transfer_item.file_id){
                            files[file_index].transfer_log.push(transfer_item_log)
                          }
                        })
                      })
                      //console.log(files)
                      res.json({account_check: 1, files: files}) // 允許
                    })
                  })


                }else{
                  res.json({account_check: 3}) // 該帳號沒有圖片
                }
              })

            }else{
              res.json({account_check: 0}) // 沒有這個帳號
            }

          })
        }else if(login_user[0].role_id == 3){ // 局處管理者

          userModel.getOne('pid', req.params.account, function(user_results){

            if(user_results.length > 0){
              if(user_results[0].organ_id == login_user[0].organ_id){

                fileModel.getAllWhere({ "column": "created_at", "sort_type": "DESC" }, { "column_name": "user_id", "operator": "=", "column_value": user_results[0].id }, function(files){
                  //console.log(files)
                  if(files.length > 0){

                    userModel.getAll({ column: 'created_at', sort_type: 'DESC' }, function(users_result){
                      fileTransferModel.getAll({ column: 'created_at', sort_type: 'DESC' }, function(files_transfer_result){
                        //console.log(files_transfer_result)
                        files.forEach(function(file_item, file_index){
                          files[file_index].transfer_log = []
                          files_transfer_result.forEach(function(transfer_item, transfer_index){

                            let transfer_item_log = {
                              created_at: transfer_item.created_at
                            }
                            users_result.forEach(function(user_item, user_index){
                              if(transfer_item.user_id_from == user_item.id){
                                transfer_item_log.user_from = user_item.pid
                              }
                              if(transfer_item.user_id_to == user_item.id){
                                transfer_item_log.user_to = user_item.pid
                              }
                            })
                            if(file_item.id == transfer_item.file_id){
                              files[file_index].transfer_log.push(transfer_item_log)
                            }
                          })
                        })
                        //console.log(files)
                        res.json({account_check: 1, files: files}) // 允許
                      })
                    })

                  }else{
                    res.json({account_check: 3}) // 該帳號沒有圖片
                  }
                })

              }else{
                res.json({account_check: 2}) // 表示組織不同
              }

            }else{
              res.json({account_check: 0}) // 沒有這個帳號
            }


          })

        }else{}
      })

      //res.json({delete_result: 0})
    })

    // 圖片權限移轉：開始進行移轉
    app.put('/transfer-files-from/:account_from/to/:account_to', function(req, res){
      //console.log(req.body.transfer_files)
      //res.json({account_check: 0}) // 沒有這個帳號

      userModel.getOne('u_id', req.session.u_id, function(login_user){

        if(login_user[0].role_id == 1){ // 平台管理者
          userModel.getOne('pid', req.params.account_to, function(user_results){

            if(user_results.length > 0){

              // 進行移轉
              userModel.getOne('pid', req.params.account_from, function(user_results_from){
                fileModel.getAllWhere({ "column": "created_at", "sort_type": "DESC" }, { "column_name": "user_id", "operator": "=", "column_value": user_results_from[0].id }, function(files){
                  //console.log(files)
                  // fileTransferModel
                  files.forEach(function(file_item, file_index){

                    if(req.body.transfer_files.includes( (file_item.id).toString() )){

                      fileTransferModel.save_with_created_at({file_id: file_item.id, user_id_from: user_results_from[0].id, user_id_to: user_results[0].id}, true, function(save_result){

                        let update_obj = {'user_id': user_results[0].id, 'organ_id': user_results[0].organ_id}
                        let where_obj = {'id': file_item.id}
                        fileModel.update(update_obj, where_obj, true, function(result){
                          //res.json({"u_id": req.query.u_id, "role_id": req.query.role})

                          if(files.length == file_index + 1){
                            redisFileDataModel.import_to_redis()
                            res.json({account_check: 1})
                          }
                        });


                      })
                    }else{
                      if(files.length == file_index + 1){
                        redisFileDataModel.import_to_redis()
                        res.json({account_check: 1})
                      }
                    }

                  })

                })
              })


            }else{
              res.json({account_check: 0}) // 沒有這個帳號
            }

          })
        }else if(login_user[0].role_id == 3){ // 局處管理者

          userModel.getOne('pid', req.params.account_to, function(user_results){

            if(user_results.length > 0){
              if(user_results[0].organ_id == login_user[0].organ_id){

                // 開始進行移轉
                userModel.getOne('pid', req.params.account_from, function(user_results_from){
                  fileModel.getAllWhere({ "column": "created_at", "sort_type": "DESC" }, { "column_name": "user_id", "operator": "=", "column_value": user_results_from[0].id }, function(files){
                    //console.log(files)
                    // fileTransferModel
                    files.forEach(function(file_item, file_index){

                      if(req.body.transfer_files.includes( (file_item.id).toString() )){

                        fileTransferModel.save_with_created_at({file_id: file_item.id, user_id_from: user_results_from[0].id, user_id_to: user_results[0].id}, true, function(save_result){

                          let update_obj = {'user_id': user_results[0].id, 'organ_id': user_results[0].organ_id}
                          let where_obj = {'id': file_item.id}
                          fileModel.update(update_obj, where_obj, true, function(result){
                            //res.json({"u_id": req.query.u_id, "role_id": req.query.role})

                            if(files.length == file_index + 1){
                              redisFileDataModel.import_to_redis()
                              res.json({account_check: 1})
                            }
                          });


                        })
                      }else{
                        if(files.length == file_index + 1){
                          redisFileDataModel.import_to_redis()
                          res.json({account_check: 1})
                        }
                      }

                    })

                  })
                })

              }else{
                res.json({account_check: 2}) // 表示組織不同
              }

            }else{
              res.json({account_check: 0}) // 沒有這個帳號
            }


          })

        }else{}
      })

      //res.json({delete_result: 0})
    })

    // 圖片下載：篩選
    app.get('/images/download-filter', function(req, res){
      //console.log(req.query.public_item)
      //console.log(req.query.private_item)
      //console.log(req.query.share_item)
      userModel.getOne('u_id', req.session.u_id, function(login_user){
        switch(req.query.filter_range){

          case "by_all": // 全部
            if(login_user[0].role_id == 1){
              fileModel.getAll({ "column": "created_at", "sort_type": "DESC" }, function(results){
                //console.log(results)
                let files_result = []
                results.forEach(function(file_item, file_index){
                  if(parseInt(req.query.public_item) == 1 && file_item.permissions == "1"){
                    files_result.push(file_item)
                  }
                  if(parseInt(req.query.private_item) == 1 && file_item.permissions == "2"){
                    files_result.push(file_item)
                  }
                  if(parseInt(req.query.share_item) == 1 && file_item.permissions == "3"){
                    files_result.push(file_item)
                  }
                })
                res.json({msg: "success", files: files_result})
              })
            }else{
              res.json({msg: "denied", files: []})
            }
            break;

          case "by_organ": // 局處
            if(login_user[0].role_id == 1 || login_user[0].role_id == 3){
              let limit_organ_id = req.query.organ_id
              if(login_user[0].role_id == 3){
                limit_organ_id = login_user[0].organ_id // 限定只能是自己局處
              }

              fileModel.getAllWhere({ "column": "created_at", "sort_type": "DESC" }, { "column_name": "organ_id", "operator": "=", "column_value": "'" + limit_organ_id + "'" }, function(results){
                //console.log(results)
                let files_result = []
                results.forEach(function(file_item, file_index){
                  if(parseInt(req.query.public_item) == 1 && file_item.permissions == "1"){
                    files_result.push(file_item)
                  }
                  if(parseInt(req.query.private_item) == 1 && file_item.permissions == "2"){
                    files_result.push(file_item)
                  }
                  if(parseInt(req.query.share_item) == 1 && file_item.permissions == "3"){
                    files_result.push(file_item)
                  }
                })
                res.json({msg: "success", files: files_result})
              })
            }else{
              res.json({msg: "denied", files: []})
            }
            break;

          case "by_account": // 帳號
            //console.log("here: " + req.query.user_account)

            userModel.getOne('pid', req.query.user_account, function(user_results){
              if(user_results.length > 0){
                let can_call = true
                let wrong_msg
                if(login_user[0].role_id == 2 && req.query.user_account != login_user[0].pid){ // 一般帳號
                  can_call = false
                  wrong_msg = "限定只能使用登入的帳號"
                }
                if(login_user[0].role_id == 3 && user_results[0].organ_id != login_user[0].organ_id){ // 局處管理者
                  can_call = false
                  wrong_msg = "限定只能相同局處的帳號"
                }

                if(can_call){
                  fileModel.getAllWhere({ "column": "created_at", "sort_type": "DESC" }, { "column_name": "user_id", "operator": "=", "column_value": user_results[0].id }, function(results){
                    //console.log(results)
                    let files_result = []
                    results.forEach(function(file_item, file_index){
                      if(parseInt(req.query.public_item) == 1 && file_item.permissions == "1"){
                        files_result.push(file_item)
                      }
                      if(parseInt(req.query.private_item) == 1 && file_item.permissions == "2"){
                        files_result.push(file_item)
                      }
                      if(parseInt(req.query.share_item) == 1 && file_item.permissions == "3"){
                        files_result.push(file_item)
                      }
                    })
                    res.json({msg: "success", files: files_result})
                  })
                }else{
                  res.json({msg: wrong_msg, files: []})
                }


              }else{
                res.json({msg: "沒有這個帳號", files: []})
              }

            })
            break;

          default:
        }
      })

    })

    // 圖片下載
    app.post('/images/download', function(req, res){

      //console.log(req.body.files)
      //console.log(CONFIG.path.storage_temp)

      if(req.body.files.length > 0){
        if(!fs.existsSync(CONFIG.path.storage_temp)){ // 若資料夾不存在，就建立
          fs.mkdirSync(CONFIG.path.storage_temp)
        }

        let parallel_func = []
        req.body.files.forEach((file_id, i) => {
          //console.log(file_id)
          parallel_func.push(function(callback){
            fileModel.getOne('id', parseInt(file_id), function(file_result){
              //console.log(file_result)
              callback(null, file_result[0])
            })
          })
        })

        async.parallel(parallel_func,
          // optional callback
          function(errs, results) { // parallel_func 全部的 functions 執行完，才會執行這個 function
            if(errs) throw errs

            //console.log(results)

            let file_paths = [] // 取得圖片的路徑
            results.forEach((item, i) => {
              let file_data = JSON.parse(item.file_data)
              file_data.forEach((fd, j) => {
                if(fd.origin){
                  file_paths.push(fd.url)
                }
              })
            })
            file_paths = file_paths.map(function(value, index){
              return value.replace('/storage_uploads', '');;
            });

            //console.log(file_paths)

            let d = new Date();
            let dir_name = d.getFullYear() + functions.str_pad(d.getMonth() + 1, 2) + functions.str_pad(d.getDate(), 2) + "_" + d.getTime()

            if(CONFIG.appenv.env == "local" || CONFIG.appenv.env == "staging"){

              // 複製到 temp 資料夾裡
              let dir_path = CONFIG.path.storage_temp + "/" + dir_name
              fs.mkdirSync(dir_path)

              let parallel_func2 = []
              file_paths.forEach((file_id, i) => {
                //console.log(file_id)
                parallel_func2.push(function(callback){
                  //console.log("cp " + CONFIG.path.storage_uploads + file_paths[i] + " " + dir_path)
                  exec("cp " + CONFIG.path.storage_uploads + file_paths[i] + " " + dir_path, function(error, stdout, stderr){
                    callback(null, "")
                  })

                })
              })

              // 將檔案都複製到 temp 資料夾裡的資料夾
              async.parallel(parallel_func2,
                // optional callback
                function(errs, results) {
                  console.log("複製完成")

                  // 壓縮
                  let zip = new AdmZip()
                  //zip.addLocalFile(dir_path)
                  fs.readdirSync(dir_path).forEach(file => {
                    zip.addLocalFile(dir_path + "/" + file)
                  })
                  let zip_file_name = CONFIG.path.storage_temp + "/" + dir_name + ".zip"
                  zip.writeZip(zip_file_name)
                  console.log("壓縮完成")

                  // 回傳
                  //res.json({msg: 1, download_path: CONFIG.appenv.storage.domain + CONFIG.appenv.storage.path_temp + "/" + dir_name + ".zip"})
                  res.json({msg: 1, download_filename: dir_name})
                  console.log("回傳下載網址")
                }
              )



            }else if(CONFIG.appenv.env == "production"){
              console.log("正式機 download")

              client_ssh_sftp.connect({
                  host: CONFIG.appenv.storage.scp.ip,
                  port: 22,
                  username: CONFIG.appenv.storage.scp.user,
                  password: CONFIG.appenv.storage.scp.password
              }).then(() => {
                console.log("connect here")
                // 複製到 temp 資料夾裡
                let dir_path = CONFIG.appenv.storage.storage_temp_path + "/" + dir_name
                console.log(dir_path)
                return client_ssh_sftp.mkdir(dir_path, true);
                //console.log(delete_file_path)
                //client_ssh_sftp.delete(delete_file_path);

              }).then(() => {
                return client.client_ssh_sftp()
              }).catch((err) => {
                console.log(err.message);
              })

            }else{
              res.json({msg: 0})
            }

          }
        )


      }else{
        res.json({msg: 0})
      }

    })

  })

}
