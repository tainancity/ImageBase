var formidable = require('formidable')
var util = require('util')
var soap = require('soap')
var CONFIG = require('../config/global.js')

var userModel = require(CONFIG.path.models + '/user.js')
var functions = require(CONFIG.path.helpers + '/functions.js')

var u_id_duplicate = false
var unique_id = functions.generate_u_id()
var insert_obj = {}

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
    userModel.save(insert_obj, function(){})
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

    // 測試帳： logintest
    // 測試密： GINTE@tn
    soap.createClient(url, function(err, client) {
      var args = {strToken: 'abcde', strApCode: CONFIG.app.appcode, strAcct: pid, strPwd: password}
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
            "organ_id": 1, // result.SSO_Auth_ValidateResult.UserOrganId
            "pid": result.SSO_Auth_ValidateResult.VerifiedAccount,
            "name": result.SSO_Auth_ValidateResult.UserName,
            "email": result.SSO_Auth_ValidateResult.UserEmail,
            "job_title": result.SSO_Auth_ValidateResult.UserJobTitle,
            "portrait_url": result.SSO_Auth_ValidateResult.UserPortraitUrl,
            "tel_office": result.SSO_Auth_ValidateResult.UserTelOffice,
            "tel_personal": result.SSO_Auth_ValidateResult.UserTelPersonal
          }

          userModel.getOne('pid', result.SSO_Auth_ValidateResult.VerifiedAccount, function(results){
            if(results.length == 1){ // 帳號已存在於 db
              req.session.u_id = results[0].u_id
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
  }
}

// get: logout
exports.logout = function(options) {
  return function(req, res) {
    req.session.destroy()
    res.redirect('/')
  }
}
