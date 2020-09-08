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
  db.runSql("ALTER TABLE short_urls ADD COLUMN edit_log TEXT DEFAULT NULL AFTER pageviews;");
  db.runSql("ALTER TABLE short_urls ADD COLUMN deleted_at INT DEFAULT NULL AFTER updated_at;");
  return db.runSql("ALTER TABLE short_urls ADD COLUMN is_active INT DEFAULT 1 AFTER pageviews;");
  //return null;
};

exports.down = function(db) {
  db.removeColumn('short_urls', 'edit_log');
  db.removeColumn('short_urls', 'deleted_at');
  return db.removeColumn('short_urls', 'is_active');
  //return null;
};

exports._meta = {
  "version": 1
};
