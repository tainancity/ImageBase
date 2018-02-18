var CONFIG = require('../config/global.js')
var baseModel = require(CONFIG.path.models + '/base.js')

const table_name = 'log_login'
const table_columns = ['user_id', 'token', 'verified_result', 'verified_message', 'ip', 'logout_at']

exports.save = function(insert_obj, cb) {
  baseModel.save(table_name, table_columns, insert_obj, cb)
}

exports.save_for_logout = function(insert_obj, cb) {
  baseModel.save(table_name, table_columns, insert_obj, cb)
}


exports.update = function(update_obj, where_obj, cb) {
  baseModel.update(table_name, update_obj, where_obj, cb)
}

exports.getOne = function(u_id_col, u_id, cb) {
  baseModel.getOne(table_name, u_id_col, u_id, cb)
}


/**
 * sort_obj = { "column": "created_at", "sort_type": "DESC" }
 *
 */
 /*
exports.getAll = function(sort_obj, cb) {
  baseModel.getAll(table_name, sort_obj, cb)
}*/

/**
 * sort_obj = { "column": "created_at", "sort_type": "DESC" }
 * where_obj = { "column_name": "user_id", "operator": ">=", "column_value": 0 }
 */
exports.getAllWhere = function(sort_obj, where_obj, cb) {
  baseModel.getAllWhere(table_name, sort_obj, where_obj, cb)
}
