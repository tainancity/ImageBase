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
  return db.createTable('api_keys', {
    id: { type: 'int', primaryKey: true, autoIncrement: true, unsigned: true, length: 11 },
    user_id: { type: 'int', unsigned: true, notNull: true, foreignKey: {
      name: 'fk_user_id_in_users',
      table: 'users',
      rules: {
        onDelete: 'RESTRICT',
        onUpdate: 'RESTRICT'
      },
      mapping: 'id'
    }},
    api_key: { type: 'string', notNull: true }, // 標題
    request_times: { type: 'int' },             // 使用次數(requests)

    created_at: { type: 'int' },
    updated_at: { type: 'int' }
  });
};

exports.down = function(db) {
  return db.dropTable('api_keys');
};

exports._meta = {
  "version": 1
};
