var CONFIG = require('../config/global.js')
var settingModel = require(CONFIG.path.models + '/setting.js')
var userModel = require(CONFIG.path.models + '/user.js')

// 檢查是否為維護模式
exports.is_maintenance_mode = function(app){
  return function(req, res, next){

    settingModel.getOne('option_name', 'is_maintenance', function(result){
      res.locals.is_maintenance = result[0].option_value
      if(result[0].option_value == '1'){ // 維護模式開啟中

        if(req.session.u_id != undefined){ // 登入狀態
          userModel.getOne('u_id', req.session.u_id, function(results){
            if(results[0].role_id == 1){ // 是 Admin
              if((req.url).includes("/pages/maintain") || (req.url).includes("/user/login") || (req.url).includes("/admin/management")){
                next()
              }else{
                res.redirect('/pages/maintain')
              }
            }else{ // Not Admin
              res.redirect('/pages/maintain')
            }
          })
        }else{
          if((req.url).includes("/pages/maintain") || (req.url).includes("/user/login")){
            next()
          }else{
            res.redirect('/pages/maintain')
          }
        }

      }else{ // 維護模式關閉中
        if((req.url).includes("/pages/maintain")){
          if(req.session.u_id != undefined){ // 登入狀態
            userModel.getOne('u_id', req.session.u_id, function(results){
              if(results[0].role_id == 1){ // 是 Admin
                next() // 仍可看到維護頁面
              }else{ // Not Admin
                res.redirect('/')
              }
            })
          }else{
            res.redirect('/')
          }
        }else{
          next()
        }

      }
    })

  }
}
