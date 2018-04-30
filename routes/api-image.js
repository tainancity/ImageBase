var CONFIG = require('../app/config/global.js')
var cors = require('cors')
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
  app.use(cors()) // allow cors
  app.group('/api/v1.0/image', (app) => {
    app.get('/:u_id', apiImage.image_get(options))
    app.put('/:u_id', apiImage.image_put_data(options))
    app.get('/', apiImage.image_get_by_data(options))
    app.post('/', apiImage.image_post(options))
    app.delete('/trash/:u_id', apiImage.image_soft_delete(options))
    app.delete('/trash/:u_id/undo', apiImage.image_soft_delete_undo(options))
    app.delete('/delete/:u_id', apiImage.image_hard_delete(options))

    // 未進 api
    app.post('/crop', apiImage.image_crop(options))
  })

}
