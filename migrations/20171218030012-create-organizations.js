'use strict';

var dbm;
var type;
var seed;

var CONFIG = require('../app/config/global.js')
var csv = require('csv-parser')
var fs = require('fs')

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
    parent_organ_id: { type: 'string' },           // 上層單位代碼
    sort_index: { type: 'int', defaultValue: 0 },  // 同階層中的排序
    show_index: { type: 'int', defaultValue: 0 },  // 該組織是否在首頁中出現
    created_at: { type: 'int' },
    updated_at: { type: 'int' },
    deleted_at: { type: 'int' }
  }, function(err){
    if (err) console.error(err)

    fs.createReadStream(CONFIG.path.assets + '/csv/organization_csv.csv')
      .pipe(csv(['organ_id', 'organ_name', 'organ_name_abbr', 'level', 'parent_organ_id']))
      .on('data', function (data) {
        if(data.organ_id == undefined){
          data.organ_id = ""
        }
        if(data.organ_name == undefined){
          data.organ_name = ""
        }
        if(data.organ_name_abbr == undefined){
          data.organ_name_abbr = ""
        }
        if(data.level == undefined){
          data.level = ""
        }
        if(data.parent_organ_id == undefined){
          data.parent_organ_id = ""
        }
        if(data.organ_id != "單位代碼"){
          db.runSql("INSERT INTO organizations(`organ_id`, `organ_name`, `organ_name_abbr`, `level`, `parent_organ_id`) VALUES('" + data.organ_id + "', '" + data.organ_name + "', '" + data.organ_name_abbr + "', '" + data.level + "', '" + data.parent_organ_id + "');");
        }
      })
  });
};

exports.down = function(db) {
  return db.dropTable('organizations');
};

exports._meta = {
  "version": 1
};
