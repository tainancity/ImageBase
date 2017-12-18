var path = require('path')
var fs = require('fs')

var global_config = {}
var current_folder = path.join(__dirname)

fs.readdirSync(current_folder).forEach(file => {
  if(file !== path.basename(__filename)){
    global_config[file.replace('.js', '')] = require(current_folder + '/' + file)
  }
})

module.exports = global_config
