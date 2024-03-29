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
  return db.createTable('file_carousel', {
    id: { type: 'int', primaryKey: true, autoIncrement: true, unsigned: true, length: 11 },
    file_id: { type: 'int', unsigned: true, notNull: true, foreignKey: {
      name: 'fk_file_id_in_file_carousel',
      table: 'files',
      rules: {
        onDelete: 'RESTRICT',
        onUpdate: 'RESTRICT'
      },
      mapping: 'id'
    }},
    sort_index: { type: 'int' } // 排序
  });
};

exports.down = function(db) {
  return db.dropTable('file_carousel');
};

exports._meta = {
  "version": 1
};
