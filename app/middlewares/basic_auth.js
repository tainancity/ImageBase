// BASIC AUTH Post
exports.basic_auth_post = function(app){
  return function(req, res, next){
    if(req.body.basic_username == 'pic_alpha' && req.body.basic_password == 'pic_alpha'){
      res.cookie('basic_auth', '1')
      res.redirect('/')
    }else{
      next()
    }
  }
}

// basic auth
exports.basic_auth = function(app){
  return function(req, res, next){
    if(req.cookies.basic_auth == '1'){
      next()
    }else{
      res.render('frontend/auth/basic_auth_custom', { csrfToken: req.csrfToken() })
    }
  }
}
