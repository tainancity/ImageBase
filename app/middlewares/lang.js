var CONFIG = require('../config/global.js')

var functions = require(CONFIG.path.helpers + '/functions.js')

// custom lang
exports.custom_lang = function(app){
  return function(req, res, next){
    // 網址有語系 → 判斷該語系是否與 語系 cookie 一樣 → 若不一樣或沒有語系 cookie，則將該網址語系寫入 cookie → 使用此語系 cookie
    //                                          → 若一樣，則直接使用語系 cookie
    // 網址沒有語系 → 判斷有無語系 cookie → 沒有的話，寫入預設的語系 cookie → 並直接使用預設語系
    //                                → 有的話，則直接使用語系中的 cookie
    console.log(req.originalUrl)

    var req_url_array = req.originalUrl.split('/')
    if(req_url_array[1] == 'site'){
      next()
    }else{
      var url_lang = functions.get_url_lang(req.originalUrl)

      var cookie_lang = req.cookies.lang
      var is_redirect = false
      if(CONFIG.app.support_langs.indexOf(url_lang) == -1){
        if (cookie_lang === undefined){
          res.cookie('lang', CONFIG.app.default_lang, { maxAge: 3600 * 24 * 365 * 1000, httpOnly: true }); // expire after one year
          cookie_lang = CONFIG.app.default_lang
        }
        // redirect
        is_redirect = true
      }else{
        res.cookie('lang', url_lang, { maxAge: 3600 * 24 * 365 * 1000, httpOnly: true }); // expire after one year
        if (cookie_lang === undefined){
          cookie_lang = url_lang
        }
      }

      res.locals.CurrentLang = url_lang
      if(is_redirect){
        var req_url_str = ''
        req_url_str += '/' + cookie_lang
        for(var i = 0; i < req_url_array.length; i++){
          if(i > 0){
            req_url_str += '/' + req_url_array[i]
          }
        }

        res.redirect(301, CONFIG.appenv.domain + req_url_str)
      }else{
        next()
      }
    }

  }
}
