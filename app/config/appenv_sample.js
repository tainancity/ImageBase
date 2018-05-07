var path = require('path')
var database = require('../../database.json')

const APPENV = {
  domain: '', // 網域名稱，若有80以外的 port，需加上：例 //localhost:3001
  port: 3001, // 指定的 port，與上面的 port 需相同
  sessionCookieName: '', // session cookie 的名稱
  cookieSessionSecret: '', // cookie session 的加密
  debug: true, // debug 模式
  full_api_key: '', // 站內可透過此 key 來使用 RESTful API
  cipher: {
    algorithm: 'aes-256-ctr', // 資料加密模式
    password: '' // cipher 密碼
  },
  env: database.defaultEnv, // 環境變數
  db: { // MariaDB 設定
    host: database.local.host,
    port: database.local.port,
    user: database.local.user,
    password: database.local.password,
    database: database.local.database,
    charset: 'UTF8MB4_UNICODE_CI'
  },
  redis: { // Redis 設定
    host: 'localhost',
    port: 6379,
    password: ''
  },
  storage: {
    domain: '', // storage domain
    port: 3002, // storage port
    path: '', // storage upload path
    project_path: '', // 專案在 unix 系統中的專案路徑
    storage_uploads_path: '', // 專案上傳的所在位置
    scp: { // scp 設定
      user: '',
      password: '',
      ip: ''
    }
  }
}

module.exports = APPENV
