var CONFIG = require('../app/config/global.js')

module.exports = function(app){

  var options = {}

  app.group('/api-ajax/v1.0', (app) => {
    app.get('/account-token-auth', function(req, res){
      let token = req.query.token
      if(token == 'abcde'){
        res.send("1")
        return
      }
      res.send("2")
    })

  })

}
