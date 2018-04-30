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
  return db.createTable('log_login', {
    id: { type: 'int', primaryKey: true, autoIncrement: true, unsigned: true, length: 11 },
    user_id: { type: 'int', unsigned: true },
    /*user_id: { type: 'int', unsigned: true, notNull: true, foreignKey: {
      name: 'fk_user_id_in_log_login',
      table: 'users',
      rules: {
        onDelete: 'RESTRICT',
        onUpdate: 'RESTRICT'
      },
      mapping: 'id'
    }},*/

    token: { type: 'string' },                            // token
    verified_result: { type: 'boolean' },                 // 提取結果，成功為 true，失敗為false
    verified_message: {type: 'string'},                   // 提取結果文字說明
    ip: { type: 'string' },                               // ip

    created_at: { type: 'int' },
    updated_at: { type: 'int' },
    logout_at: { type: 'int' }                            // 登出的時間
  });
};

exports.down = function(db) {
  return db.dropTable('log_login');
};

exports._meta = {
  "version": 1
};
