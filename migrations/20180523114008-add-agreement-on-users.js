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
  /*return db.addColumn('users', 'agreement', {
    type: 'int',
    defaultValue: '0'
  });*/
  return db.runSql("ALTER TABLE users ADD COLUMN agreement INT DEFAULT 0 AFTER tel_personal;");
};

exports.down = function(db) {
  return db.removeColumn('users', 'agreement');
};

exports._meta = {
  "version": 1
};
