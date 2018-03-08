var CONFIG = require('../config/global.js')
var settingModel = require(CONFIG.path.models + '/setting.js')

// get logo path
exports.get_logo_path = function(app){
  return function(req, res, next) {
    settingModel.getOne('option_name', 'logo_file', function(result){
      if(result[0].option_value == '' || result[0].option_value == null){
        app.locals.logo_path = ''
      }else{
        app.locals.logo_path = result[0].option_value
      }
      next()
    })
  }
}
