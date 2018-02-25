var CONFIG = require('../config/global.js')
var baseModel = require(CONFIG.path.models + '/base.js')

const table_name = 'settings'
const table_columns = ['option_name', 'option_value']

/*
exports.save = function(insert_obj, cb) {
  baseModel.save(table_name, table_columns, insert_obj, cb)
}
*/

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
}
*/
