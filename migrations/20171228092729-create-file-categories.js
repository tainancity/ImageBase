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
  return db.createTable('file_categories', {
    id: { type: 'int', primaryKey: true, autoIncrement: true, unsigned: true, length: 11 },
    category_name: { type: 'string', notNull: true },
    level: { type: 'int' },                                   // 階層深度
    parent_category_id: { type: 'int' },                      // 父分類
    sort_index: { type: 'int' },                              // 同分類中的排序
    show_index: { type: 'int', defaultValue: 0 }              // 該分類是否在首頁中出現
  }, function(err){
    if (err) console.error(err)

    db.runSql("INSERT INTO file_categories(`category_name`, `level`, `parent_category_id`, `sort_index`) VALUES('其它', 1, 0, 0);");
  });
};

exports.down = function(db) {
  return db.dropTable('file_categories');
};

exports._meta = {
  "version": 1
};
