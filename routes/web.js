var CONFIG = require('../app/config/global.js')
var Auth = require(CONFIG.path.middlewares + '/auth.js')

var Home = require(CONFIG.path.controllers + '/home.js')

module.exports = function(app){


  var options = {}

  app.group('/(:lang)?', (app) => {
    // Home
    app.get('/', Home.index(options))

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

  /*
  // Customer Site
  app.group('/site/:u_id', (app) => {

    // homepage
    app.get('/', Site.index(options))

    // product page
    app.get('/product/:u_id', Site.product(options))

    // product category page
    app.get('/categories', Site.categories(options))

    // contact us page
    app.get('/contact-us', Site.contact_us(options))
  })
  */





  /*
  // ========== 404，因為不是錯誤，所以不會有 err 參數 ========== //
  app.use(function (req, res) {
    res.status(404).send("404 Not Found! Sorry can't find that!")
  })

  // ========== 500 ========== //
  app.use(function (err, req, res, next) {
    console.error(err.stack)
    res.status(500).send("500 Error!")
    //res.status(500).render('errors/500')
  })
  */


}
