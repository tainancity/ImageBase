var CONFIG = require('../config/global.js')
var baseModel = require(CONFIG.path.models + '/base.js')

const table_name = 'file_categories'
const table_columns = ['category_name', 'level', 'parent_category_id', 'sort_index', 'show_index']


exports.save = function(insert_obj, has_time, cb) {
  baseModel.save(table_name, table_columns, insert_obj, has_time, cb)
}

exports.update = function(update_obj, where_obj, has_time, cb) {
  baseModel.update(table_name, update_obj, where_obj, has_time, cb)
}

exports.getOne = function(u_id_col, u_id, cb) {
  baseModel.getOne(table_name, u_id_col, u_id, cb)
}


/**
 * sort_obj = { "column": "created_at", "sort_type": "DESC" }
 *
 */
exports.getAll = function(sort_obj, cb) {
  baseModel.getAll(table_name, sort_obj, cb)
}

/**
 * sort_obj = { "column": "created_at", "sort_type": "DESC" }
 * where_obj = { "column_name": "user_id", "operator": ">=", "column_value": 0 }
 */
exports.getAllWhere = function(sort_obj, where_obj, cb) {
  baseModel.getAllWhere(table_name, sort_obj, where_obj, cb)
}

// ========== 刪除相關 ========== //
exports.deleteOne = function(u_id_col, u_id, cb) {
  baseModel.deleteOne(table_name, u_id_col, u_id, cb)
}
