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
  return db.createTable('users', {
    id: { type: 'int', primaryKey: true, autoIncrement: true, unsigned: true, length: 11 },
    u_id: { type: 'string', unique: true, length: 191, notNull: true },
    role_id: { type: 'int', unsigned: true, notNull: true,defaultValue: 2, foreignKey: {
      name: 'fk_role_id_in_users',
      table: 'roles',
      rules: {
        onDelete: 'RESTRICT',
        onUpdate: 'RESTRICT'
      },
      mapping: 'id'
    }},
    organ_id: { type: 'string', notNull: false}, // 使用者單位代碼
    pid: { type: 'string', unique: true, length: 191 },   // 使用者帳號
    name: { type: 'string' },                             // 使用者姓名
    email: { type: 'string', unique: true, length: 191 }, // 使用者email
    job_title: { type: 'string' },                        // 使用者職稱
    portrait_url: { type: 'string' },                     // 使用者大頭照url
    tel_office: { type: 'string' },                       // 使用者辦公室電話
    tel_personal: { type: 'string' },                     // 使用者私人電話

    //email_active: { type: 'char', defaultValue: '0', notNull: true },
    //password: { type: 'string' },

    created_at: { type: 'int' },
    updated_at: { type: 'int' },
    deleted_at: { type: 'int' }
  });
};

exports.down = function(db) {
  return db.dropTable('users');
};

exports._meta = {
  "version": 1
};
