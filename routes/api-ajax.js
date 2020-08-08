var CONFIG = require('../app/config/global.js')
var userModel = require(CONFIG.path.models + '/user.js')
var logLoginModel = require(CONFIG.path.models + '/log_login.js')
var fileCarouselModel = require(CONFIG.path.models + '/file_carousel.js')
var fileModel = require(CONFIG.path.models + '/file.js')
var shortUrlModel = require(CONFIG.path.models + '/short_urls.js')
var fileLikeModel = require(CONFIG.path.models + '/file_like.js')
var fileTransferModel = require(CONFIG.path.models + '/file_transfer.js')

var redisFileDataModel = require(CONFIG.path.redis + '/redis_file_data.js')

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


  })

}
