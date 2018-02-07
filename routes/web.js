var CONFIG = require('../app/config/global.js')
var Auth = require(CONFIG.path.middlewares + '/auth.js')
var Basic_Auth = require(CONFIG.path.middlewares + '/basic_auth.js')

var Home = require(CONFIG.path.controllers + '/home.js')
var User = require(CONFIG.path.controllers + '/user.js')
var Announcement = require(CONFIG.path.controllers + '/announcement.js')
var Page = require(CONFIG.path.controllers + '/page.js')
var File = require(CONFIG.path.controllers + '/file.js')
var Search = require(CONFIG.path.controllers + '/search.js')

var AdminAccount = require(CONFIG.path.controllers + '/admin/account.js')

module.exports = function(app){

  // Custom Basic Auth
  if(CONFIG.appenv.env != 'production'){
    app.post('/basic_auth', Basic_Auth.basic_auth_post())
    app.use(Basic_Auth.basic_auth())
  }

  var options = {}

  // Home
  app.get('/', Home.index(options))

  app.group('/user', (app) => {
    app.get('/login', Auth.is_not_auth(options), User.login(options))
    app.post('/login', User.login_post(options))
    app.get('/logout', User.logout(options))
  })

  // 測試
  app.post('/image-upload', Home.image_upload(options))


  app.group('/f', (app) => {
    // 獨立檔案
    app.get('/abc', File.item(options))
  })

  app.group('/if', (app) => {
    // iframe
    app.get('/abc', File.item_iframe(options))
  })

  app.group('/announcement', (app) => {
    // 公告列表
    app.get('/list', Announcement.list(options))
  })

  app.group('/search', (app) => {
    // 搜尋
    app.get('/', Search.index(options))
  })

  app.group('/pages', (app) => {
    // 平台服務說明
    app.get('/service', Page.service(options))

    // 維護中
    app.get('/maintain', Page.maintain(options))
  })


  // admin
  app.group('/admin', (app) => {
    //app.use(Auth.is_auth(app))
    app.get('/', AdminAccount.index(options))

    /*
    app.get('/account', Admin.account(options))
    app.put('/account_info', Admin.account_info(options))
    app.put('/account_company', Admin.account_company(options))
    app.put('/account_password_modify', Admin.account_password_modify(options))

    app.get('/pricing', Admin.pricing(options))

    app.get('/theme', Admin.theme(options))
    */
  })



  // ========== 404，因為不是錯誤，所以不會有 err 參數 ========== //
  app.use(function (req, res) {
    //res.status(404).send("404 Not Found! Sorry can't find that!")
    res.status(404).render('frontend/errors/404.pug')
  })

  /*
  // ========== 500 ========== //
  app.use(function (err, req, res, next) {
    console.error(err.stack)
    res.status(500).send("500 Error!")
    //res.status(500).render('errors/500')
  })
  */


}
