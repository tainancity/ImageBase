var fs = require('fs')
var crypto = require('crypto')
var CONFIG = require('../config/global.js')
const BCRYPT = require('bcrypt')
var moment = require('moment')

module.exports = {


  // encrypt text
  encrypt: function(text) {
    var cipher = crypto.createCipher(CONFIG.appenv.cipher.algorithm, CONFIG.appenv.cipher.password)
    var crypted = cipher.update(text,'utf8','hex')
    crypted += cipher.final('hex')
    return crypted
  },



  // 密碼加密：password bcrypt
  pwd_bcrypt: function(pwd, cb) {
    BCRYPT.hash(pwd, 12, cb)
  },

  // 比對密碼
  pwd_compare: function(plain_text_password, hash_password, cb) {
    BCRYPT.compare(plain_text_password, hash_password, cb)
  },

  // 0 ~ 9999999999: 左邊補 0
  generate_u_id: function(){
    var temp_id = (parseInt(Math.random() * 10000000000)).toString()
    if(temp_id.length < 10){
      var zero_number = ""
      for(var i = 0; i < (10 - temp_id.length); i++){
        zero_number = zero_number.toString() + "0"
      }
      temp_id = zero_number + temp_id
    }
    return temp_id
  },

  // 產生 api key
  generate_api_key: function(){
    var temp_api_key = ""
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
    for (var i = 0; i < 32; i++){
      temp_api_key += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return temp_api_key
  },

  // generate token:
  generate_token: function(){
    var temp_token = ""
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
    for (var i = 0; i < 20; i++){
      temp_token += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return temp_token
  },

  // generate random code:
  generate_random_code: function(num){
    var temp_code = ""
    var possible = "abcdefghijklmnopqrstuvwxyz0123456789"
    for (var i = 0; i < num; i++){
      temp_code += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return temp_code
  },

  // get url language
  get_url_lang: function(original_url){
    var req_url_array = original_url.split('/')
    if(req_url_array[1] == 'site'){
      return ''
    }else{
      return req_url_array[1]
    }
  },

  // lang
  i18n: function(original_url, lang_str) {
    var url_lang = this.get_url_lang(original_url)

    var filename_key = lang_str.split('.')
    var lang_obj = JSON.parse(fs.readFileSync(CONFIG.path.lang + '/' + url_lang + '/' + filename_key[0] + '.json', 'utf8'))

    var i18n_str = lang_obj[filename_key[1]]
    if(arguments[2] !== undefined){
      for (var k in arguments[2]){
        i18n_str = i18n_str.replace(":" + k, arguments[2][k]);
        //console.log("Key is " + k + ", value is" + arguments[1][k]);
      }
    }
    return i18n_str
  }

};
