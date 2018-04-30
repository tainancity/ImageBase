var CONFIG = require('../config/global.js')

// custom lang
exports.rm_trailing_slash = function(app){
  return function(req, res, next){
    if(req.url.substr(-1) == '/' && req.url.length > 1){
      res.redirect(301, req.url.slice(0, -1))
    }else{
      next()
    }
  }
}
