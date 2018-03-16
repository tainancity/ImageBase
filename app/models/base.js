var CONFIG = require('../config/global.js')
var conn = require(CONFIG.path.db + '/connect.js')

// get current seconds
var timestamp_now = function(){
  return Date.now() / 1000
}

exports.conn = conn

exports.save = function(table_name, table_columns, insert_data, has_time, cb) {
  // save only specific columns in table
  var insert_obj = {}
  for (var i = 0; i < table_columns.length; i++) {
    insert_obj[table_columns[i]] = insert_data[table_columns[i]]
  }
  if(has_time){
    insert_obj.created_at = insert_obj.updated_at = timestamp_now()
  }

  conn.query('INSERT INTO ' + table_name + ' SET ?', insert_obj, function (error, results, fields) {
    if (error) throw error
    cb(results)
  })
  //console.log(query.sql)
}

exports.update = function(table_name, update_obj, where_obj, has_time, cb) {
  if(has_time){
    update_obj.updated_at = timestamp_now()
  }
  conn.query('UPDATE ' + table_name + ' SET ? WHERE ?', [update_obj, where_obj], function (error, results, fields) {
    if (error) throw error
    cb(results)
  })
  //console.log(query.sql)
}

exports.getOne = function(table_name, u_id_col, u_id, cb) {
  conn.query('SELECT * FROM `' + table_name + '` WHERE `' + u_id_col + '` = ? LIMIT 1', [u_id], function (error, results, fields) {
    if (error) throw error
    cb(results)
  })
  //console.log(query.sql)
}

exports.getAll = function(table_name, sort_obj, cb) {
  conn.query('SELECT * FROM `' + table_name + '` ORDER BY ' + sort_obj.column + ' ' + sort_obj.sort_type, function (error, results, fields) {
    if (error) throw error
    cb(results)
  })
  //console.log(query.sql)
}

exports.getAllWhere = function(table_name, sort_obj, where_obj, cb){
  conn.query('SELECT * FROM `' + table_name + '` WHERE ' + where_obj.column_name + ' ' + where_obj.operator + ' ' + where_obj.column_value + ' ORDER BY ' + sort_obj.column + ' ' + sort_obj.sort_type, function (error, results, fields) {
    if (error) throw error
    cb(results)
  })
  //console.log(query.sql)
}

// ========== 刪除相關 ========== //
exports.deleteOne = function(table_name, u_id_col, u_id, cb) {
  conn.query('DELETE FROM `' + table_name + '` WHERE `' + u_id_col + '` = ? LIMIT 1', [u_id], function (error, results, fields) {
    if (error) throw error
    cb(results)
  })
  //console.log(query.sql)
}
