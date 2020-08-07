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
  return db.createTable('files_transfer', {
    id: { type: 'int', primaryKey: true, autoIncrement: true, unsigned: true, length: 11 },
    file_id: { type: 'int', unsigned: true, notNull: true, foreignKey: {
      name: 'fk_file_id_in_files_transfer',
      table: 'files',
      rules: {
        onDelete: 'RESTRICT',
        onUpdate: 'RESTRICT'
      },
      mapping: 'id'
    }},
    user_id_from: { type: 'int', unsigned: true, notNull: true, foreignKey: {
      name: 'fk_user_id_from_in_files_transfer',
      table: 'users',
      rules: {
        onDelete: 'RESTRICT',
        onUpdate: 'RESTRICT'
      },
      mapping: 'id'
    }},
    user_id_to: { type: 'int', unsigned: true, notNull: true, foreignKey: {
      name: 'fk_user_id_to_in_files_transfer',
      table: 'users',
      rules: {
        onDelete: 'RESTRICT',
        onUpdate: 'RESTRICT'
      },
      mapping: 'id'
    }},
    created_at: { type: 'int' }
  });
};

exports.down = function(db) {
  return db.dropTable('files_transfer');
};

exports._meta = {
  "version": 1
};
