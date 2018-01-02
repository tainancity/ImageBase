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
  return db.createTable('files_tags', {
    id: { type: 'int', primaryKey: true, autoIncrement: true, unsigned: true, length: 11 },
    file_id: { type: 'int', unsigned: true, notNull: true, foreignKey: {
      name: 'fk_file_id_in_files_tags',
      table: 'files',
      rules: {
        onDelete: 'RESTRICT',
        onUpdate: 'RESTRICT'
      },
      mapping: 'id'
    }},
    tag_id: { type: 'int', unsigned: true, notNull: true, foreignKey: {
      name: 'fk_tag_id_in_files_tags',
      table: 'tags',
      rules: {
        onDelete: 'RESTRICT',
        onUpdate: 'RESTRICT'
      },
      mapping: 'id'
    }},
  });
};

exports.down = function(db) {
  return db.dropTable('files_tags');
};

exports._meta = {
  "version": 1
};
