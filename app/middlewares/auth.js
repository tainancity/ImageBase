var CONFIG = require('../config/global.js')
var userModel = require(CONFIG.path.models + '/user.js')
var functions = require(CONFIG.path.helpers + '/functions.js')

// is login or not
exports.is_auth = function(app){
  return function(req, res, next) {
    if(req.session.u_id){ // Login
      next()
    }else{ // Not Login
      res.send('目前尚未登入！')
    }
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
    }else{
      next()
    }
  }
}
