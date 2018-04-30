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
  return db.createTable('announcements', {
    id: { type: 'int', primaryKey: true, autoIncrement: true, unsigned: true, length: 11 },
    title: { type: 'string', notNull: true }, // 標題
    is_only_link: { type: 'boolean' },        // 僅放連結
    is_draft: { type: 'boolean' },            // 是否為草稿
    sort_index: { type: 'int' },              // 排序
    contents: { type: 'text' },               // 內容

    created_at: { type: 'int' },
    updated_at: { type: 'int' },
    deleted_at: { type: 'int' }
  });
};

exports.down = function(db) {
  return db.dropTable('announcements');
};

exports._meta = {
  "version": 1
};
