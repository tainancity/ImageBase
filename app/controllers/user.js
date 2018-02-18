var formidable = require('formidable')
var util = require('util')
var soap = require('soap')
var CONFIG = require('../config/global.js')

var userModel = require(CONFIG.path.models + '/user.js')
var logLoginModel = require(CONFIG.path.models + '/log_login.js')
var functions = require(CONFIG.path.helpers + '/functions.js')

var u_id_duplicate = false
var unique_id = functions.generate_u_id()
var insert_obj = {}
var update_obj = {}
var insert_log_obj = {}

var have_the_same_u_id = function(u_id, cb){
  userModel.getOne('u_id', u_id, function(results_check){
    if(results_check.length == 1){
      u_id_duplicate = true
    }else{
      u_id_duplicate = false
    }
    cb()
  })
}

var duplicate_func = function(req, res, result){
  if(u_id_duplicate){
    //console.log("重新產生新的u_id")
    unique_id = functions.generate_u_id()
    have_the_same_u_id(unique_id, function(){
      duplicate_func(req, res, result)
    })
  }else{
    //console.log("新增")
    insert_obj.u_id = unique_id
    userModel.save(insert_obj, function(result){

      // log_login
      insert_log_obj.user_id = result.insertId
      logLoginModel.update(insert_log_obj, {"token": insert_log_obj.token}, function(){})
    })
    req.session.u_id = unique_id
    res.json(result.SSO_Auth_ValidateResult)
  }
}


exports.login = function(options) {
  return function(req, res) {
    res.render('frontend/user/login', { csrfToken: req.csrfToken() })
  }
}


exports.login_post = function(options) {
  return function(req, res) {
    var url = 'https://login.tainan.gov.tw/ws/WS_SSO.asmx?WSDL'
    var pid = req.body.pid
    var password = req.body.password
    if(CONFIG.appenv.env == 'local'){ // 因為如果是 local 端的話，驗證回傳網址是線上的網址，所以這裡固定是寫靜態的 'abcde'
      var generated_token = 'abcde'
    }else{
      var generated_token = functions.generate_token()
    }


    // log_login
    insert_log_obj = {
      "user_id": "",
      "token": generated_token,
      "verified_result": "",
      "verified_message": "",
      "ip": req.ip
    }

    logLoginModel.save(insert_log_obj, function(){
      // 測試帳： logintest
      // 測試密： GINTE@tn
      soap.createClient(url, function(err, client) {
        var args = {strToken: generated_token, strApCode: CONFIG.app.appcode, strAcct: pid, strPwd: password}
        client.SSO_Auth_Validate(args, function(err, result, raw, soapHeader) {
          // result is a javascript object
          // raw is the raw response
          // soapHeader is the response soap header as a javascript object

          /*
          正常回傳結果：
          { VerifiedToken: '00000000-0000-0000-0000-000000000000',
    VerifiedAPCode: 'picalpha',
    VerifiedAccount: 'logintest',
    VerifiedResult: true,
    VerifiedMessage: '驗證成功',
    UserPid: '',
    UserName: '主測試員',
    UserOrganId: '395000331-',
    UserDirectorOrganId: '395000300A',
    UserOrganName: '臺南市政府智慧發展中心駐府人員',
    UserOrganShortName: '駐府人員',
    UserJobTitle: '系統保留帳號',
    UserPortraitUrl: 'https://login.tainan.gov.tw/portraits/up1706050508461662INTE.jpg',
    UserTelOffice: '2991111',
    UserTelPersonal: '',
    UserEmail: 'logintest@mail.tainan.gov.tw' }
          */

          // console.log(result.SSO_Auth_ValidateResult)
          if(result.SSO_Auth_ValidateResult.VerifiedResult){
            insert_obj = {
              "u_id": "",
              "role_id": 2,
              "organ_id": result.SSO_Auth_ValidateResult.UserOrganId,
              "pid": result.SSO_Auth_ValidateResult.VerifiedAccount,
              "name": functions.encrypt(result.SSO_Auth_ValidateResult.UserName),
              "email": functions.encrypt(result.SSO_Auth_ValidateResult.UserEmail),
              "job_title": result.SSO_Auth_ValidateResult.UserJobTitle,
              "portrait_url": result.SSO_Auth_ValidateResult.UserPortraitUrl,
              "tel_office": functions.encrypt(result.SSO_Auth_ValidateResult.UserTelOffice),
              "tel_personal": functions.encrypt(result.SSO_Auth_ValidateResult.UserTelPersonal)
            }

            update_obj = { // encrypt
              "organ_id": result.SSO_Auth_ValidateResult.UserOrganId,
              "name": functions.encrypt(result.SSO_Auth_ValidateResult.UserName),
              "email": functions.encrypt(result.SSO_Auth_ValidateResult.UserEmail),
              "job_title": result.SSO_Auth_ValidateResult.UserJobTitle,
              "portrait_url": result.SSO_Auth_ValidateResult.UserPortraitUrl,
              "tel_office": functions.encrypt(result.SSO_Auth_ValidateResult.UserTelOffice),
              "tel_personal": functions.encrypt(result.SSO_Auth_ValidateResult.UserTelPersonal)
            }

            // log_login
            insert_log_obj.verified_result = result.SSO_Auth_ValidateResult.VerifiedResult
            insert_log_obj.verified_message = result.SSO_Auth_ValidateResult.VerifiedMessage

            userModel.getOne('pid', result.SSO_Auth_ValidateResult.VerifiedAccount, function(results){
              if(results.length == 1){ // 帳號已存在於 db
                userModel.update(update_obj, {"pid": result.SSO_Auth_ValidateResult.VerifiedAccount}, function(){})
                req.session.u_id = results[0].u_id

                // log_login
                insert_log_obj.user_id = results[0].id
                logLoginModel.update(insert_log_obj, {"token": generated_token}, function(){})

                res.json(result.SSO_Auth_ValidateResult)
              }else{
                have_the_same_u_id(unique_id, function(){
                  duplicate_func(req, res, result)
                })
              }
            })
          }else{
            res.json(result.SSO_Auth_ValidateResult)
          }

        })
      })
    })

  }
}

// get: logout
exports.logout = function(options) {
  return function(req, res) {

    userModel.getOne('u_id', req.session.u_id, function(results){
      // log_login
      var insert_log_obj_for_logout = {
        "user_id": results[0].id,
        "ip": req.ip,
        "logout_at": Date.now() / 1000
      }
      logLoginModel.save_for_logout(insert_log_obj_for_logout, function(){})
    })

    req.session.destroy()
    res.redirect('/')
  }
}
