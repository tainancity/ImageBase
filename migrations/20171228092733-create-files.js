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
  return db.createTable('files', {
    id: { type: 'int', primaryKey: true, autoIncrement: true, unsigned: true, length: 11 },
    u_id: { type: 'string', unique: true, length: 191, notNull: true },
    user_id: { type: 'int', unsigned: true, notNull: true, foreignKey: {
      name: 'fk_user_id_in_files',
      table: 'users',
      rules: {
        onDelete: 'RESTRICT',
        onUpdate: 'RESTRICT'
      },
      mapping: 'id'
    }},
    category_id: { type: 'int', unsigned: true, notNull: true,defaultValue: 1, foreignKey: {
      name: 'fk_category_id_in_files',
      table: 'file_categories',
      rules: {
        onDelete: 'RESTRICT',
        onUpdate: 'RESTRICT'
      },
      mapping: 'id'
    }},
    organ_id: { type: 'string', notNull: false}, // 使用者單位代碼
    title: { type: 'string' },            // 標題
    file_type: { type: 'char' },          // 檔案類型：1圖片、2非圖片
    file_path: { type: 'string' },         // 路徑
    file_ext: { type: 'string' },         // 副檔名
    file_data: { type: 'text' },           // 檔案基本資料：檔名、檔案大小、寬高

    pageviews: { type: 'int' },           // 瀏覽量

    permissions: { type: 'char', defaultValue: '1' },        // 檔案權限：1公開(預設，前台看得到)、2隱藏(前台看不到，短網址只有原上傳者及平台管理者看得到)、3共用(前台看不到，知道短網址的人，皆可看到)

    created_at: { type: 'int' },
    updated_at: { type: 'int' },
    deleted_at: { type: 'int' }
  });
};

exports.down = function(db) {
  return db.dropTable('files');
};

exports._meta = {
  "version": 1
};
