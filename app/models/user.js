var CONFIG = require('../config/global.js')
var baseModel = require(CONFIG.path.models + '/base.js')

const table_name = 'users'
const table_columns = ['u_id', 'role_id', 'organ_id', 'pid', 'name', 'email', 'job_title', 'portrait_url', 'tel_office', 'tel_personal', 'agreement']

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
