var CONFIG = require('../config/global.js')
var baseModel = require(CONFIG.path.models + '/base.js')

const table_name = 'users'
const table_columns = ['u_id', 'email', 'password', 'nickname']

exports.save = function(insert_obj, cb) {
  baseModel.save(table_name, table_columns, insert_obj, cb)
}

exports.update = function(update_obj, where_obj, cb) {
  baseModel.update(table_name, update_obj, where_obj, cb)
}

exports.getOne = function(u_id_col, u_id, cb) {
  baseModel.getOne(table_name, u_id_col, u_id, cb)
}

/*
module.exports = function() {
  this.conn = baseModel.conn
  this.table_name = 'users'
  this.table_columns = ['email', 'password', 'nickname']

  save: function save(insert_data) {
    baseModel.save(this.table_name, insert_data)
  }
}
*/
