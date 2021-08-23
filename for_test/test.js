let CONFIG = require('../app/config/global.js')

let client_ssh = require('ssh2-sftp-client')
let client_ssh_sftp = new client_ssh()

client_ssh_sftp.connect({
  host: CONFIG.appenv.storage.scp.ip,
  port: 22,
  username: CONFIG.appenv.storage.scp.user,
  password: CONFIG.appenv.storage.scp.password
}).then(() => {
  let remoteDir = CONFIG.path.project + "/for_test/abc/a";
  return client_ssh_sftp.mkdir(remoteDir, false);
}).then(data => {
  return client_ssh_sftp.end();
}).catch(err => {
  console.log("這裡");
  console.log(err);
  console.log("這裡2");
});
console.log("123");
