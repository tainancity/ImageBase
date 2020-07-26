var CONFIG = require('../config/global.js')
var userModel = require(CONFIG.path.models + '/user.js')
var functions = require(CONFIG.path.helpers + '/functions.js')

// is login or not
exports.is_auth = function(app){
  return function(req, res, next) {
    if(req.session.u_id){ // Login
      next()
    }else{ // Not Login
      res.redirect('/')
    }
  }
}
exports.is_not_auth = function(app){
  return function(req, res, next) {
    if(req.session.u_id){ // Login
      res.redirect('/')
    }else{ // Not Login
      next()
    }
  }
}
exports.is_admin = function(app){
  return function(req, res, next) {
    userModel.getOne('u_id', req.session.u_id, function(results){
      if(results[0].role_id == 1 || results[0].role_id == 3){ // 局處管理者或平台管理者
        next()
      }else{ // Not Admin
        res.redirect('/')
      }
    })
  }
}

// setting front-end variables
exports.setting_locals = function(app){
  return function(req, res, next) {
    app.locals.auth = {}
    app.locals.auth.is_auth = req.session.u_id ? true : false
    if(req.session.u_id){
      app.locals.auth.u_id = req.session.u_id
      userModel.getOne('u_id', req.session.u_id, function(results){
        app.locals.auth.user = results[0]
        next()
      })
      //next()
    }else{
      next()
    }
  }
}
