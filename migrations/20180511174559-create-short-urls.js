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
  return db.createTable('short_urls', {
    id: { type: 'int', primaryKey: true, autoIncrement: true, unsigned: true, length: 11 },
    u_id: { type: 'string', unique: true, length: 191, notNull: true },
    user_id: { type: 'int', unsigned: true, notNull: true, foreignKey: {
      name: 'fk_user_id_in_short_urls',
      table: 'users',
      rules: {
        onDelete: 'RESTRICT',
        onUpdate: 'RESTRICT'
      },
      mapping: 'id'
    }},
    long_url: { type: 'text' }, // 原(長)網址

    pageviews: { type: 'int' }, // 瀏覽量

    created_at: { type: 'int' },
    updated_at: { type: 'int' }
  });
};

exports.down = function(db) {
  return db.dropTable('short_urls');
};

exports._meta = {
  "version": 1
};
