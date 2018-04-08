var CONFIG = require('../app/config/global.js')
var userModel = require(CONFIG.path.models + '/user.js')
var logLoginModel = require(CONFIG.path.models + '/log_login.js')
var fileCarouselModel = require(CONFIG.path.models + '/file_carousel.js')
var fileModel = require(CONFIG.path.models + '/file.js')

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

      /*
      var update_obj = {"role_id": req.query.role}
      var where_obj = {"u_id": req.query.u_id}
      userModel.update(update_obj, where_obj, function(result){
        //res.json({"u_id": req.query.u_id, "role_id": req.query.role})
        res.json(result)
      });
      */
    })

  })

}
