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
  return db.createTable('settings', {
    id: { type: 'int', primaryKey: true, autoIncrement: true, unsigned: true, length: 11 },

    option_name: { type: 'string', notNull: true }, // 欲設定的屬性名
    option_value: { type: 'text' },                 // 欲設定的屬性值

    updated_at: { type: 'int' }
  }, function(err){
    if (err) console.error(err)

    db.runSql("INSERT INTO settings(`option_name`) VALUES('logo_file');");             // logo 檔案
    db.runSql("INSERT INTO settings(`option_name`) VALUES('logo_ch_name');");          // logo 中文名
    db.runSql("INSERT INTO settings(`option_name`) VALUES('logo_en_name');");          // logo 英文名
    db.runSql("INSERT INTO settings(`option_name`) VALUES('platform_desc');");         // 平台說明
    db.runSql("INSERT INTO settings(`option_name`) VALUES('not_found_desc');");        // 404 頁面的說明
    db.runSql("INSERT INTO settings(`option_name`) VALUES('is_maintenance');");        // 是否在維護中
    db.runSql("INSERT INTO settings(`option_name`) VALUES('maintenance_desc');");      // 維護中說明
    db.runSql("INSERT INTO settings(`option_name`) VALUES('ga_code');");               // GA code
    db.runSql("INSERT INTO settings(`option_name`) VALUES('upload_filesize_limit');"); // 上傳檔案上限
  });
};

exports.down = function(db) {
  return db.dropTable('settings');
};

exports._meta = {
  "version": 1
};
