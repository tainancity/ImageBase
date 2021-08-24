'use strict';

var dbm;
var type;
var seed;

/**
  * We receive the dbmigrate dependency from dbmigrate initially.
  * This enables us to not have to rely on NODE_PATH.
  */
exports.setup = function(options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = function(db) {
  return db.runSql("INSERT INTO settings(`option_name`, `option_value`) VALUES('upload_filetotal_limit', '10');"); // 上傳檔案張數上限
};

exports.down = function(db) {
  return db.runSql("DELETE FROM settings WHERE option_name = 'upload_filetotal_limit';"); // 上傳檔案張數上限
};

exports._meta = {
  "version": 1
};
