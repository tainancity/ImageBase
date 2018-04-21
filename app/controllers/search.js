var CONFIG = require('../config/global.js')
//var functions = require(CONFIG.path.helpers + '/functions.js')

var fileCategoryModel = require(CONFIG.path.models + '/file_category.js')
var organizationModel = require(CONFIG.path.models + '/organization.js')
var tagModel = require(CONFIG.path.models + '/tag.js')

exports.index = function(options) {
  return function(req, res) {
    fileCategoryModel.getAll({column: 'level', sort_type: 'ASC'}, function(all_categories){
      organizationModel.getAll({column: 'id', sort_type: 'ASC'}, function(all_organs){
        tagModel.getAll({column: 'id', sort_type: 'DESC'}, function(all_tags){
          res.render('frontend/search/index', {
            categories: all_categories,
            organs: all_organs,
            tags: all_tags,
            csrfToken: req.csrfToken(),
            client_ip: req.headers['x-forwarded-for'] || req.ip
          })
        })
      })
    })

  }
}
