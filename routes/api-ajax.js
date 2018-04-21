var CONFIG = require('../app/config/global.js')
var userModel = require(CONFIG.path.models + '/user.js')
var logLoginModel = require(CONFIG.path.models + '/log_login.js')
var fileCarouselModel = require(CONFIG.path.models + '/file_carousel.js')
var fileModel = require(CONFIG.path.models + '/file.js')
var fileLikeModel = require(CONFIG.path.models + '/file_like.js')

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
      userModel.update(update_obj, where_obj, function(result){
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

  })

}
