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

exports.save_with_created_at = function(table_name, table_columns, insert_data, has_time, cb) {
  // save only specific columns in table
  var insert_obj = {}
  for (var i = 0; i < table_columns.length; i++) {
    insert_obj[table_columns[i]] = insert_data[table_columns[i]]
  }
  if(has_time){
    insert_obj.created_at = timestamp_now()
  }

  conn.query('INSERT INTO ' + table_name + ' SET ?', insert_obj, function (error, results, fields) {
    if (error) throw error
    cb(results)
  })
  //console.log(query.sql)
}

// var update_obj = { column_name: 'column_name_value' }
// var where_obj = { column_name: 'column_name_value' }
exports.update = function(table_name, update_obj, where_obj, has_time, cb) {
  if(has_time){
    update_obj.updated_at = timestamp_now()
  }
  let query = conn.query('UPDATE ' + table_name + ' SET ? WHERE ?', [update_obj, where_obj], function (error, results, fields) {
    if (error) throw error
    cb(results)
  })
  console.log(query.sql)
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

exports.getAll2Where = function(table_name, sort_obj, where_obj1, where_obj2, cb){
  var query = conn.query('SELECT * FROM `' + table_name + '` WHERE ' + where_obj1.column_name + ' ' + where_obj1.operator + ' ' + where_obj1.column_value + ' AND ' + where_obj2.column_name + ' ' + where_obj2.operator + ' ' + where_obj2.column_value + ' ORDER BY ' + sort_obj.column + ' ' + sort_obj.sort_type, function (error, results, fields) {
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

// u_id_col
// u_id
exports.deleteWhere = function(table_name, u_id_col, u_id, cb) {
  conn.query('DELETE FROM `' + table_name + '` WHERE `' + u_id_col + '` = ?', [u_id], function (error, results, fields) {
    if (error) throw error
    cb(results)
  })
  //console.log(query.sql)
}

// u_id_col
// u_id
exports.delete2Where = function(table_name, u_id_col, u_id, u_id_col_2, u_id_2, cb) {
  conn.query('DELETE FROM `' + table_name + '` WHERE `' + u_id_col + '` = ? AND `' + u_id_col_2 + '` = ?', [u_id, u_id_2], function (error, results, fields) {
    if (error) throw error
    cb(results)
  })
  //console.log(query.sql)
}

// 計算某欄位的數量出現幾次
// column_obj = { name: 'file_id', alias: 'file_id_total', sort_value: 'DESC' }
exports.count_column = function(table_name, column_obj, cb) {
  conn.query('SELECT ' + column_obj.name + ', COUNT(' + column_obj.name + ') AS ' + column_obj.alias + ' FROM ' + table_name + ' GROUP BY ' + column_obj.name + ' ORDER BY ' + column_obj.alias + ' ' + column_obj.sort_value, function (error, results, fields) {
    if (error) throw error
    cb(results)
  })
  //console.log(query.sql)
}
