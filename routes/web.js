var CONFIG = require('../app/config/global.js')
var Auth = require(CONFIG.path.middlewares + '/auth.js')

var Home = require(CONFIG.path.controllers + '/home.js')
var User = require(CONFIG.path.controllers + '/user.js')
var Announcement = require(CONFIG.path.controllers + '/announcement.js')
var Page = require(CONFIG.path.controllers + '/page.js')
var File = require(CONFIG.path.controllers + '/file.js')

module.exports = function(app){


  var options = {}

  // Home
  app.get('/', Home.index(options))

  app.group('/user', (app) => {


    app.get('/login', User.login(options))



    /*
    // User
    app.group('/user', (app) => {
      app.get('/register', User.register(options))
      app.post('/register_h', User.register_h(options))
      app.get('/login', User.login(options))
      app.post('/login_h', User.login_h(options))
      app.get('/logout', User.logout(options))
    })
    */
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

  app.group('/pages', (app) => {
    // 平台服務說明
    app.get('/service', Page.service(options))

    // 維護中
    app.get('/maintain', Page.maintain(options))
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
