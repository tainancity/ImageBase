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
  return db.runSql("INSERT INTO roles(`id`, `role`) VALUES(3, '局處管理者');");
  //return null;
};

exports.down = function(db) {
  return db.runSql("DELETE FROM roles WHERE role = '局處管理者';");
  //return null;
};

exports._meta = {
  "version": 1
};
