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
  return db.createTable('organizations', {
    id: { type: 'int', primaryKey: true, autoIncrement: true, unsigned: true, length: 11 },
    organ_id: { type: 'string', notNull: true },   // 單位代碼
    organ_name: { type: 'string' },                // 單位全銜
    organ_name_abbr: { type: 'string' },           // 單位縮寫
    level: { type: 'int' },                        // 階層深度
    parent_organ_id: { type: 'int' },              // 上層單位代碼
    sort_index: { type: 'int', defaultValue: 0 }   // 同階層中的排序
  });
};

exports.down = function(db) {
  return db.dropTable('organizations');
};

exports._meta = {
  "version": 1
};
