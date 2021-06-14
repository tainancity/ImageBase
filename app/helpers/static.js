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
    let textParts = text.split(':');
    let iv = Buffer.from(textParts.shift(), 'hex');
    let encryptedText = Buffer.from(textParts.join(':'), 'hex');
    let key = crypto.scryptSync(CONFIG.appenv.cipher.password, 'salt', 32);
    let decipher = crypto.createDecipheriv(CONFIG.appenv.cipher.algorithm, key, iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
  }
};
