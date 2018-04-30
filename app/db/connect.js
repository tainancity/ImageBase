var mysql = require('mysql');
var CONFIG = require('../config/global.js');

var pool = mysql.createPool(CONFIG.appenv.db);
module.exports = pool;
