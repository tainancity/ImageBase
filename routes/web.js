var CONFIG = require('../app/config/global.js')
var Auth = require(CONFIG.path.middlewares + '/auth.js')

var Home = require(CONFIG.path.controllers + '/home.js')
var User = require(CONFIG.path.controllers + '/user.js')

module.exports = function(app){


  var options = {}

  app.group('/', (app) => {
    // Home
    app.get('/', Home.index(options))

    app.get('/user/login', User.login(options))

    // 測試
    app.post('/image-upload', Home.image_upload(options))

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



  // ========== 404，因為不是錯誤，所以不會有 err 參數 ========== //
  app.use(function (req, res) {
    res.status(404).send("404 Not Found! Sorry can't find that!")
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
