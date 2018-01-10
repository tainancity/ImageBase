var CONFIG = require('../app/config/global.js')

module.exports = function(app){

  var options = {}

  app.group('/api-ajax/v1.0', (app) => {
    /*
    app.post('/account-token-auth', function(req, res){
      let token = req.body.token
      if(token == 'abcde'){
        res.send("1")
      }
      res.send("2")
    })
    */
    
    app.get('/account-token-auth', function(req, res){
      let token = req.body.token
      res.send("1")
    })

  })

}
