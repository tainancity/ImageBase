var CONFIG = require('../config/global.js')
var settingModel = require(CONFIG.path.models + '/setting.js')
var fs = require('fs')

var functions = require(CONFIG.path.helpers + '/functions.js')

// custom lang
exports.global = function(app){
  return function(req, res, next){

    // full url path
    res.locals.current_url = req.protocol + ':' + CONFIG.appenv.domain + req.url

    // return switch language full url path
    //res.locals.lang_switch = function(current_lang, lang_change, current_url){
      //return current_url.replace(current_lang, lang_change)
    //}

    // official url
    res.locals.url = function(url){
      var url_lang = functions.get_url_lang(req.originalUrl)
      return CONFIG.appenv.domain + '/' + url_lang + url
    }

    // i18n language
    // res.locals.i18n = function(){
    //   var url_lang = functions.get_url_lang(req.originalUrl)
    //
    //   var filename_key = arguments[0].split('.')
    //   var lang_obj = JSON.parse(fs.readFileSync(CONFIG.path.lang + '/' + url_lang + '/' + filename_key[0] + '.json', 'utf8'))
    //
    //   var i18n_str = lang_obj[filename_key[1]]
    //   if(arguments[1] !== undefined){
    //     for (var k in arguments[1]){
    //       i18n_str = i18n_str.replace(":" + k, arguments[1][k]);
    //       //console.log("Key is " + k + ", value is" + arguments[1][k]);
    //     }
    //   }
    //   return i18n_str
    // }

    // is current url
    res.locals.is_current_url = function(search_str, active_class){
      return (req.originalUrl).indexOf(search_str) > -1 ? active_class : ''
    }

    next()
  }
}
