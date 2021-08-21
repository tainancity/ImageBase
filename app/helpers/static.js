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

    const key = crypto.scryptSync(CONFIG.appenv.cipher.password, 'salt', 24);
    const iv = Buffer.alloc(16, 0); // Initialization vector.

    const decipher = crypto.createDecipheriv(CONFIG.appenv.cipher.algorithm, key, iv);

    let decrypted = decipher.update(text, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    //console.log(`解密後的資料：${decrypted}`);
    return decrypted;

  },
  decrypt_new: function(text) {
    const key = crypto.scryptSync(CONFIG.appenv.cipher.password, 'salt', 24);
    const iv = Buffer.alloc(16, 0); // Initialization vector.

    const decipher = crypto.createDecipheriv(CONFIG.appenv.cipher.algorithm, key, iv);

    let decrypted = decipher.update(text, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    //console.log(`解密後的資料：${decrypted}`);
    return decrypted;
  }

};
