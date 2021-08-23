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

  let remoteDir2 = CONFIG.path.project + "/for_test/def/b";
  client_ssh_sftp.mkdir(remoteDir2, true);

  client_ssh_sftp.mkdir(remoteDir, true);
  return;
}).then(() => {
  // DSC05910.jpg
  let localFile = CONFIG.path.project + "/for_test/DSC05910.jpg";
  let remoteFile = CONFIG.path.project + "/for_test/abc/a/DSC05910.jpg";
  client_ssh_sftp.fastPut(localFile, remoteFile);
  return;
}).then(() => {
  console.log("執行到這end");
  return client_ssh_sftp.end();
}).catch(err => {
  console.log("這裡");
  console.log(err);
  console.log("這裡2");
});
console.log("123");
