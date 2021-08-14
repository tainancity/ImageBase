var fs = require('graceful-fs')
var crypto = require('crypto')
var CONFIG = require('../config/global.js')
const BCRYPT = require('bcrypt')
var moment = require('moment')


module.exports = {


  // encrypt text
  encrypt: function(text) {
    /*
    let IV_LENGTH = 16;
    let iv = crypto.randomBytes(IV_LENGTH);
    let key = crypto.scryptSync(CONFIG.appenv.cipher.password, 'salt', 32);
    //let cipher = crypto.createCipheriv(CONFIG.appenv.cipher.algorithm, Buffer.from(CONFIG.appenv.cipher.password, 'hex'), iv);
    let cipher = crypto.createCipheriv(CONFIG.appenv.cipher.algorithm, key, iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return iv.toString('hex') + ':' + encrypted.toString('hex');
    */
    return text;

  },
  encrypt_new: function(text){
    const algorithm = 'aes-192-cbc';
    const password = CONFIG.appenv.cipher.password;
    const key = crypto.scryptSync(password, 'salt', 24);
    const iv = Buffer.alloc(16, 0); // Initialization vector.

    const cipher = crypto.createCipheriv(algorithm, key, iv);

    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    console.log(text);
    console.log(encrypted);
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
  },

  str_pad: function(my_num, digits){

    var my_num_str = my_num.toString();
    while(my_num_str.length < digits){
      my_num_str = "0" + my_num_str;
    }

    return my_num_str;
  },

  // 系統挑圖
  get_slide_from_system: function(carousel_setting_data, files, files_like_result){
    let carousels_system_files_array_hot = [] // 系統挑圖：熱門
    let carousels_system_files_array_public = [] // 系統挑圖：最新公開

    let hot_num = 0
    let public_num = 0
    if(carousel_setting_data.slide_number > 0){
      switch(carousel_setting_data.slide_number_ratio){
        case "1": // 4:1
          hot_num = parseInt((carousel_setting_data.slide_number) * 4 / 5)
          public_num = parseInt((carousel_setting_data.slide_number) * 1 / 5)
          break
        case "2": // 3:2
          hot_num = parseInt((carousel_setting_data.slide_number) * 3 / 5)
          public_num = parseInt((carousel_setting_data.slide_number) * 2 / 5)
          break
        case "3": // 2:3
          hot_num = parseInt((carousel_setting_data.slide_number) * 2 / 5)
          public_num = parseInt((carousel_setting_data.slide_number) * 3 / 5)
          break
        case "4": // 1:4
          hot_num = parseInt((carousel_setting_data.slide_number) * 1 / 5)
          public_num = parseInt((carousel_setting_data.slide_number) * 4 / 5)
          break
        default:
      }
    }

    // 系統挑圖：熱門
    files.forEach(function(file_item, file_index){ // 為每張圖片，加上按讚數
      files[file_index].like_num = 0
      files_like_result.forEach(function(file_like_item, file_like_index){
        if(file_item.id == file_like_item.file_id){
          files[file_index].like_num += 1
        }
      })
    })
    // console.log(files)

    let hot_temp = []
    files.forEach(function(file_item, file_index){
      if(file_item.permissions == "1"){ // 公開
        if( (file_item.like_num + file_item.pageviews) >= parseInt(carousel_setting_data.hot_threshold) ){
          hot_temp.push(file_item)
        }
      }
    })
    hot_temp.forEach(function(file_item, file_index){
      hot_temp[file_index].like_and_pageviews = (file_item.like_num + file_item.pageviews)
    })

    hot_temp.sort(function(a, b) { // 熱門的圖片，由大到小排序
      if (a.like_and_pageviews < b.like_and_pageviews) { return 1 }
      if (a.like_and_pageviews > b.like_and_pageviews) { return -1 }
      return 0
    })
    //console.log(hot_temp)
    let hot_num_inserted = 0
    hot_temp.forEach(function(file_item, file_index){
      if(hot_num_inserted < hot_num){
        carousels_system_files_array_hot.push(file_item)
        hot_num_inserted++
      }
    })
    //console.log(carousels_system_files_array)

    // 系統挑圖：最新公開圖片
    let public_num_inserted = 0
    files.forEach(function(file_item, file_index){
      if(file_item.permissions == "1"){ // 公開
        if(public_num_inserted < public_num){
          carousels_system_files_array_public.push(file_item)
          public_num_inserted++
        }
      }
    })
    return {
      hot_files: carousels_system_files_array_hot,
      public_files: carousels_system_files_array_public
    }
  }

};
