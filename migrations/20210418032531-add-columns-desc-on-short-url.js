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
  return db.runSql("ALTER TABLE short_urls ADD COLUMN url_desc TEXT DEFAULT NULL AFTER is_active;");
  //return null;
};

exports.down = function(db) {
  return db.removeColumn('short_urls', 'url_desc');
  //return null;
};

exports._meta = {
  "version": 1
};
