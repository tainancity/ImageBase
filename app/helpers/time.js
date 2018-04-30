var CONFIG = require('../config/global.js')
var moment = require('moment')

module.exports = {
  get_time_from_timestamp: function(lang, time_stamp){
    var day = moment.unix(time_stamp)
    // e.g.:'lll' 2017年9月18日 14:07
    // e.g.:'lll' Sep 18, 2017 2:07 PM
    return day.locale(lang).format('lll')
  }
};
