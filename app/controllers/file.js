var CONFIG = require('../config/global.js')
//var userModel = require(CONFIG.path.models + '/user.js')
//var functions = require(CONFIG.path.helpers + '/functions.js')
var fileModel = require(CONFIG.path.models + '/file.js')
var redisFileDataModel = require(CONFIG.path.redis + '/redis_file_data.js')

exports.item = function(options) {
  return function(req, res) {
    //console.log(req.params.u_id)
    redisFileDataModel.get_file(req.params.u_id, function(file_obj){
      //console.log(file_obj)
      res.render('frontend/files/item', {
        file_u_id: req.params.u_id,
        file_obj: file_obj,
        csrfToken: req.csrfToken()
      })
    })
  }
}

exports.item_iframe = function(options){
  return function(req, res) {
    //console.log(req.params.u_id)
    redisFileDataModel.get_file(req.params.u_id, function(file_obj){
      //console.log(file_obj)
      res.render('frontend/files/item_iframe', {
        file_obj: file_obj
      })
    })
  }
}
