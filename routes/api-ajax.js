var CONFIG = require('../app/config/global.js')
//var userModel = require(CONFIG.path.models + '/user.js')
var logLoginModel = require(CONFIG.path.models + '/log_login.js')

module.exports = function(app){

  var options = {}

  app.group('/api-ajax/v1.0', (app) => {
    app.get('/account-token-auth', function(req, res){
      if(CONFIG.appenv.env == 'local'){
        let token = req.query.token
        if(token == 'abcde123'){
          res.send("1")
          return
        }
        res.send("2")
      }else{
        logLoginModel.getOne('token', req.query.token, function(results_check){
          if(results_check.length == 1){
            res.send("1")
          }else{
            res.send("2")
          }
        })
      }

    })

  })

}
