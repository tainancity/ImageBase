var CONFIG = require('../config/global.js')
var settingModel = require(CONFIG.path.models + '/setting.js')

// get ga code in db
exports.get_ga_code = function(app){
  return function(req, res, next) {
    if(CONFIG.appenv.env == 'local'){
      next()
    }else{
      settingModel.getOne('option_name', 'ga_code', function(result){
        app.locals.ga_code = result[0].option_value
        next()
      })
    }

  }
}
