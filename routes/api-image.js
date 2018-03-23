var CONFIG = require('../app/config/global.js')
//var userModel = require(CONFIG.path.models + '/user.js')
//var logLoginModel = require(CONFIG.path.models + '/log_login.js')

//if( CONFIG.appenv.env == 'local' || CONFIG.appenv.env == 'staging' ){
if( CONFIG.appenv.env == 'staging' ){
  var apiImage = require(CONFIG.path.controllers + '/api/v1_0/image_for_jimp.js')
}else{
  var apiImage = require(CONFIG.path.controllers + '/api/v1_0/image_for_sharp.js')
}

module.exports = function(app){

  var options = {}

  app.group('/api/v1.0/image', (app) => {
    app.get('/:u_id', apiImage.image_get(options))
    app.post('/', apiImage.image_post(options))
    //app.put('/', )
    //app.delete('/', )
  })

}
