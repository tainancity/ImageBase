var path = require('path')

const PATH = {
  project: path.join(__dirname, '../..'),
  assets: path.join(__dirname, '../../resources/assets'),
  lang: path.join(__dirname, '../../resources/lang'),
  views: path.join(__dirname, '../../resources/views'),
  public: path.join(__dirname, '../../public'),
  routes: path.join(__dirname, '../../routes'),
  controllers: path.join(__dirname, '../controllers'),
  helpers: path.join(__dirname, '../helpers'),
  db: path.join(__dirname, '../db'),
  models: path.join(__dirname, '../models'),
  redis: path.join(__dirname, '../redis'),
  yaml: path.join(__dirname, '../yaml'),
  logger: path.join(__dirname, '../logger'),
  middlewares: path.join(__dirname, '../middlewares'),
  storage_uploads: path.join(__dirname, '../../storage/uploads'),
  storage_logs: path.join(__dirname, '../../storage/logs')
}

module.exports = PATH
