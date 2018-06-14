// ban ips
exports.ban_ips = function(app){
  return function(req, res, next) {
    // 欲擋掉的所有 ip
    var ban_ips = ['39.8.0.93']
    var user_ip = req.headers['x-forwarded-for'] || req.ip
    if(ban_ips.indexOf(user_ip) == -1){
      next()
    }else{
      //res.write("ban!")
      res.end()
    }
  }
}
