var formidable = require('formidable')
var util = require('util')

//var CONFIG = require('../config/global.js')
//var userModel = require(CONFIG.path.models + '/user.js')
//var functions = require(CONFIG.path.helpers + '/functions.js')

exports.index = function(options) {
  return function(req, res) {
    // { csrfToken: req.csrfToken() }
    var a = 'abctd'
    res.render('frontend/index', {testVar: a})
  }
}

exports.image_upload = function(options){
  return function(req, res){
    // parse a file upload
    var form = new formidable.IncomingForm();
    form.encoding = 'utf-8';
    form.uploadDir = CONFIG.path.storage_uploads;
    form.keepExtensions = true;
    form.maxFieldsSize = 10 * 1024 * 1024; // 10MB


    form.parse(req, function(err, fields, files) {
      res.writeHead(200, {'content-type': 'text/plain'});
      res.write('received upload:\n\n');
      res.write('this image text:' + fields.this_image_text);
      res.end(util.inspect({fields: fields, files: files}));
    });
  }
}
