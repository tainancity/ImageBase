var fs = require('graceful-fs')
var crypto = require('crypto')
var CONFIG = require('../config/global.js')

module.exports = {
  // mapping rev-manifest.json
  asset_path: function(path) {
    var obj = JSON.parse(fs.readFileSync(CONFIG.path.public + '/build/rev-manifest.json', 'utf8'))
    return '/build/' + obj[path];
  },

  // decrypt text
  decrypt: function(text) {
    var decipher = crypto.createDecipher(CONFIG.appenv.cipher.algorithm, CONFIG.appenv.cipher.password)
    var dec = decipher.update(text,'hex','utf8')
    dec += decipher.final('utf8')
    return dec
  }
};
