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
  return db.createTable('roles', {
    id: { type: 'int', primaryKey: true, autoIncrement: true, unsigned: true, length: 11 },
    role: { type: 'string', notNull: true }
  }, function(err){
    if (err) console.error(err)

    db.runSql("INSERT INTO roles(`role`) VALUES('Admin');");
    db.runSql("INSERT INTO roles(`role`) VALUES('Employee');");
  });
};

exports.down = function(db) {
  return db.dropTable('roles');
};

exports._meta = {
  "version": 1
};
