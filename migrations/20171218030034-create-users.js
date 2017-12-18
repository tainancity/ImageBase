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
      name: 'role_variant_role_id_fk',
      table: 'roles',
      rules: {
        onDelete: 'RESTRICT',
        onUpdate: 'RESTRICT'
      },
      mapping: 'id'
    }},
    email: { type: 'string', unique: true, length: 191, notNull: true },
    email_active: { type: 'char', defaultValue: '0', notNull: true },
    password: { type: 'string' },
    nickname: { type: 'string' },
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
