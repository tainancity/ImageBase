var CONFIG = require('../app/config/global.js')
var Auth = require(CONFIG.path.middlewares + '/auth.js')
var Basic_Auth = require(CONFIG.path.middlewares + '/basic_auth.js')

var Home = require(CONFIG.path.controllers + '/home.js')
var Image = require(CONFIG.path.controllers + '/image.js')
var User = require(CONFIG.path.controllers + '/user.js')
var Announcement = require(CONFIG.path.controllers + '/announcement.js')
var Page = require(CONFIG.path.controllers + '/page.js')
var File = require(CONFIG.path.controllers + '/file.js')
var ShortUrl = require(CONFIG.path.controllers + '/short_url.js')
var Search = require(CONFIG.path.controllers + '/search.js')

var AdminAccount = require(CONFIG.path.controllers + '/admin/account.js')
var AdminAnnouncement = require(CONFIG.path.controllers + '/admin/announcement.js')
var AdminPage = require(CONFIG.path.controllers + '/admin/page.js')
var AdminOrganization = require(CONFIG.path.controllers + '/admin/organization.js')
var AdminLogLogin = require(CONFIG.path.controllers + '/admin/log_login.js')
var AdminLogAction = require(CONFIG.path.controllers + '/admin/log_action.js')
var Settings = require(CONFIG.path.controllers + '/admin/settings.js')
var AdminFileCategory = require(CONFIG.path.controllers + '/admin/file_category.js')
var AdminFileManage = require(CONFIG.path.controllers + '/admin/file_manage.js')
var AdminShortUrlManage = require(CONFIG.path.controllers + '/admin/short_url_manage.js')

const exec = require('child_process').exec


//const async = require("async")
//const os = require("os")
module.exports = function(app){

  // Custom Basic Auth
  if(CONFIG.appenv.env != 'production'){
    app.post('/basic_auth', Basic_Auth.basic_auth_post())
    app.use(Basic_Auth.basic_auth())
  }
  var options = {}
  // for test
  // app.get('/for_test', function(req, res){
  //   console.log(os.cpus().length + "數");
  //   res.status(200).send("200")
  // })

  // Home
  app.get('/', Home.index(options))

  app.group('/user', (app) => {
    app.get('/login', Auth.is_not_auth(options), User.login(options))
    app.post('/login', User.login_post(options))
    app.get('/logout', User.logout(options))
  })

  // 基本圖片上傳
  app.post('/image-upload', Image.image_upload(options))

  // 公務帳號管理
  app.group('/admin', (app) => {
    app.use(Auth.is_auth(app))

    app.get('/', function(req, res, next){
      res.redirect('/admin/account')
    })

    // 帳號資訊
    app.get('/account', AdminAccount.index(options))
    app.post('/apply_api_key', AdminAccount.apply_api_key(options))

    // 登入歷程
    app.get('/log_login', AdminLogLogin.log_login_own(options))
  })

  // 公務帳號上傳的檔案管理
  app.group('/admin/file', (app) => {
    app.use(Auth.is_auth(app))
    app.get('/', function(req, res, next){ // 直接進到檔案列表
      res.redirect('/admin/file/list')
    })

    // 檔案列表
    app.get('/list', AdminFileManage.file_list(options))
    // 檔案編輯
    app.get('/update/:u_id', AdminFileManage.file_update(options))

    // 檔案上傳
    app.get('/upload', AdminFileManage.file_upload(options))

    // 垃圾桶
    app.get('/trash', AdminFileManage.file_list_trash(options))

    // 檔案下載
    app.get('/download', AdminFileManage.file_download(options))
  })

  // 公務帳號上傳的短網址管理
  app.group('/admin/short_url', (app) => {
    app.use(Auth.is_auth(app))
    app.get('/', function(req, res, next){ // 直接進到短網址列表
      res.redirect('/admin/short_url/list')
    })

    // 短網址
    app.get('/list', AdminShortUrlManage.short_url_list(options))
    app.get('/is_active/:short_url_id', AdminShortUrlManage.short_url_is_active(options))
    app.post('/item', AdminShortUrlManage.short_url_post(options))
  })

  // 局處管理者
  app.group('/admin/organization', (app) => {
    app.use(Auth.is_admin(app))

    // 檔案列表
    app.get('/file/list', AdminFileManage.file_list(options))

    // 垃圾桶
    app.get('/file/trash', AdminFileManage.file_list_trash(options))

    // 權限移轉
    app.get('/file/transfer', AdminFileManage.file_transfer(options))

    // 短網址列表
    app.get('/short_url/list', AdminShortUrlManage.short_url_list(options))
  })

  // 平台 Admin
  app.group('/admin/management', (app) => {
    app.use(Auth.is_admin(app))

    // 檔案列表
    app.get('/file/list', AdminFileManage.file_list(options))

    // 首頁輪播列表
    app.get('/file/carousel', AdminFileManage.file_carousel_list(options))
    app.post('/file/carousel_sort_update', AdminFileManage.file_carousel_sort_update(options))
    // 首頁輪播列表：系統挑圖
    app.put('/file/carousel_setting', AdminFileManage.file_carousel_list_setting(options))

    // 垃圾桶
    app.get('/file/trash', AdminFileManage.file_list_trash(options))

    // 權限移轉
    app.get('/file/transfer', AdminFileManage.file_transfer(options))

    // 所有公務帳號
    app.get('/all_members', AdminAccount.all_members(options))

    // 圖片分類管理
    app.get('/image_categories', AdminFileCategory.image_categories(options))
    app.get('/image_categories/create', AdminFileCategory.image_categories_create(options))
    app.post('/image_categories/create_post', AdminFileCategory.image_categories_create_post(options))
    app.get('/image_categories/edit/:itemId', AdminFileCategory.image_categories_edit(options))
    app.post('/image_categories/edit_post', AdminFileCategory.image_categories_edit_post(options))
    app.delete('/image_categories/delete/:itemId', AdminFileCategory.image_categories_delete(options))
    app.post('/image_categories_sort_update', AdminFileCategory.image_categories_sort_update(options))

    // 短網址列表
    app.get('/short_url/list', AdminShortUrlManage.short_url_list(options))

    // 公告列表管理
    app.get('/announcement_list', AdminAnnouncement.announcement_list(options))
    app.get('/announcement_add', AdminAnnouncement.announcement_add(options))
    app.post('/announcement_add_post', AdminAnnouncement.announcement_add_post(options))
    app.delete('/announcement_delete', AdminAnnouncement.announcement_delete(options))
    app.get('/announcement_edit/:itemId', AdminAnnouncement.announcement_edit(options))
    app.post('/announcement_edit_post', AdminAnnouncement.announcement_edit_post(options))
    app.post('/announcements_sort_update', AdminAnnouncement.announcements_sort_update(options))

    // 平台服務說明及儲存
    app.get('/service', AdminPage.service(options))
    app.post('/service_post', AdminPage.service_post(options))

    // 登入歷程
    app.get('/log_login', AdminLogLogin.log_login(options))

    // 組織部門匯入
    app.get('/organization/import_data', AdminOrganization.import_data(options))
    app.post('/organization/import_data_post', AdminOrganization.import_data_post(options))
    app.put('/organization/show_index_status', AdminOrganization.show_index_status(options))

    // 其他設定
    app.get('/settings', Settings.index(options))
    app.post('/settings-post', Settings.index_post(options))
    app.post('/settings-logo-file-post', Settings.logo_file_post(options))

    // 平台 log
    //app.get('/action_log', AdminLogAction.log_action(options))

    // 維護模式頁面內容
    app.get('/maintenance', AdminPage.maintenance(options))
    app.post('/maintenance_post', AdminPage.maintenance_post(options))
  })

  app.group('/search', (app) => {
    // 搜尋
    app.get('/', Search.index(options))
  })

  app.get('/:u_id', File.item(options))
  /*app.group('/f', (app) => {
    // 獨立檔案
    app.get('/:u_id', File.item(options))
  })*/

  app.group('/if', (app) => {
    // iframe
    app.get('/:u_id', File.item_iframe(options))
  })

  // 短網址導向
  app.group('/u', (app) => {
    // short url
    app.get('/:u_id', ShortUrl.short_url_redirect(options))
  })

  app.group('/announcement', (app) => {
    // 公告列表
    app.get('/list', Announcement.list(options))
  })

  app.group('/pages', (app) => {
    // 平台服務說明
    app.get('/service', Page.service(options))

    // 維護中
    app.get('/maintain', Page.maintain(options))
  })


  if(CONFIG.appenv.env == "staging"){
    app.get('/download/trigger', function (req, res) {
      res.download(CONFIG.path.storage_temp + "/" + req.query.download_filename + ".zip", function (err) {
        if (err) {
          console.log(err)
          // Handle error, but keep in mind the response may be partially-sent, so check res.headersSent
        } else {
          console.log("下載完成")
          //console.log((req.query.download_filename).indexOf("."))
          if((req.query.download_filename).indexOf(".") == -1){
            //console.log("yes | rm -r  " + CONFIG.path.storage_temp + "/" + req.query.download_filename + "*")
            exec("yes | rm -r  " + CONFIG.path.storage_temp + "/" + req.query.download_filename + "*", function(error, stdout, stderr){})
          }
        }
      })
    })
    // 下載單張
    app.get('/download/onepicture', function (req, res) {
      //console.log(req.query.download_filename)
      res.download(CONFIG.path.public + "/" + decodeURIComponent(req.query.download_filename), function (err) {
        if (err) throw err

        console.log("單張下載完成")
      })
    })
  }



  // ========== 404，因為不是錯誤，所以不會有 err 參數 ========== //
  app.use(function (req, res) {
    //res.status(404).send("404 Not Found! Sorry can't find that!")
    res.status(404).render('frontend/errors/404.pug')
  })

  // ========== 500 ========== //
  app.use(function (err, req, res, next) {
    console.error(err.stack)
    //exec("pm2 restart imagebase", function(error, stdout, stderr){
      res.status(500).send("500 Error!")
    //})
  })


}
