var CONFIG = require('../app/config/global.js')
var Auth = require(CONFIG.path.middlewares + '/auth.js')
var Basic_Auth = require(CONFIG.path.middlewares + '/basic_auth.js')

var Home = require(CONFIG.path.controllers + '/home.js')
var Image = require(CONFIG.path.controllers + '/image.js')
var User = require(CONFIG.path.controllers + '/user.js')
var Announcement = require(CONFIG.path.controllers + '/announcement.js')
var Page = require(CONFIG.path.controllers + '/page.js')
var File = require(CONFIG.path.controllers + '/file.js')
var Search = require(CONFIG.path.controllers + '/search.js')

var AdminAccount = require(CONFIG.path.controllers + '/admin/account.js')
var AdminAnnouncement = require(CONFIG.path.controllers + '/admin/announcement.js')
var AdminPage = require(CONFIG.path.controllers + '/admin/page.js')
var AdminOrganization = require(CONFIG.path.controllers + '/admin/organization.js')
var AdminLogLogin = require(CONFIG.path.controllers + '/admin/log_login.js')
var Settings = require(CONFIG.path.controllers + '/admin/settings.js')

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

  // 基本圖片上傳
  app.post('/image-upload', Image.image_upload(options))


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


  // 公務帳號管理
  app.group('/admin', (app) => {
    app.use(Auth.is_auth(app))

    app.get('/', function(req, res, next){
      res.redirect('/admin/account')
    })

    // 帳號資訊
    app.get('/account', AdminAccount.index(options))

    // 登入歷程
    app.get('/log_login', AdminLogLogin.log_login_own(options))
  })
  // 平台 Admin
  app.group('/admin/management', (app) => {
    app.use(Auth.is_admin(app))

    // 所有公務帳號
    app.get('/all_members', AdminAccount.all_members(options))


    // 公告列表管理
    app.get('/announcement_list', AdminAnnouncement.announcement_list(options))
    app.get('/announcement_add', AdminAnnouncement.announcement_add(options))
    app.post('/announcement_add_post', AdminAnnouncement.announcement_add_post(options))

    // 平台服務說明及儲存
    app.get('/service', AdminPage.service(options))
    app.post('/service_post', AdminPage.service_post(options))

    // 登入歷程
    app.get('/log_login', AdminLogLogin.log_login(options))

    // 組織部門匯入
    app.get('/organization/import_data', AdminOrganization.import_data(options))
    app.post('/organization/import_data_post', AdminOrganization.import_data_post(options))

    // 其他設定
    app.get('/settings', Settings.index(options))
    app.post('/settings-post', Settings.index_post(options))

    // 維護模式頁面內容
    app.get('/maintenance', AdminPage.maintenance(options))
    app.post('/maintenance_post', AdminPage.maintenance_post(options))
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
