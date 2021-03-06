var CONFIG = require('../config/global.js')
var baseModel = require(CONFIG.path.models + '/base.js')

const table_name = 'files_transfer'
const table_columns = ['file_id', 'user_id_from', 'user_id_to']

exports.save_with_created_at = function(insert_obj, has_time, cb) {
  baseModel.save_with_created_at(table_name, table_columns, insert_obj, has_time, cb)
}

/*
exports.update = function(update_obj, where_obj, has_time, cb) {
  baseModel.update(table_name, update_obj, where_obj, has_time, cb)
}
*/

/*exports.getOne = function(u_id_col, u_id, cb) {
  baseModel.getOne(table_name, u_id_col, u_id, cb)
}*/

/**
 * sort_obj = { "column": "created_at", "sort_type": "DESC" }
 * where_obj = { "column_name": "user_id", "operator": ">=", "column_value": 0 }
 */
exports.getAllWhere = function(sort_obj, where_obj, cb) {
  baseModel.getAllWhere(table_name, sort_obj, where_obj, cb)
}

/**
 * sort_obj = { column: 'id', sort_type: 'DESC' }
 * where_obj1 = { column_name: 'file_id', operator: '=', column_value: 0 }
 * where_obj2 = { column_name: 'tag_id', operator: '=', column_value: 0 }
 */
/*
exports.getAll2Where = function(sort_obj, where_obj1, where_obj2, cb) {
  baseModel.getAll2Where(table_name, sort_obj, where_obj1, where_obj2, cb)
}
*/

/**
 * sort_obj = { column: 'created_at', sort_type: 'DESC' }
 *
 */
exports.getAll = function(sort_obj, cb) {
  baseModel.getAll(table_name, sort_obj, cb)
}

exports.deleteWhere = function(u_id_col, u_id, cb){
  baseModel.deleteWhere(table_name, u_id_col, u_id, cb)
}

/*
exports.delete2Where = function(u_id_col, u_id, u_id_col_2, u_id_2, cb) {
  baseModel.delete2Where(table_name, u_id_col, u_id, u_id_col_2, u_id_2, cb)
}

exports.count_column = function(column_obj, cb){
  baseModel.count_column(table_name, column_obj, cb)
}
*/
