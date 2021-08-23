let CONFIG = require('../app/config/global.js')

let client_ssh = require('ssh2-sftp-client')
let client_ssh_sftp = new client_ssh()

let test_v = "here";
let test_v2 = "here2";
client_ssh_sftp.connect({
  host: CONFIG.appenv.storage.scp.ip,
  port: 22,
  username: CONFIG.appenv.storage.scp.user,
  password: CONFIG.appenv.storage.scp.password
}).then(() => {
  console.log(test_v);
  let remoteDir = CONFIG.path.project + "/for_test/abc/a";
  return client_ssh_sftp.mkdir(remoteDir, true);
}).then(() => {
  console.log(test_v);
  let localFile = CONFIG.path.project + "/for_test/DSC06106.jpg";
  let remoteFile = CONFIG.path.project + "/for_test/abc/a/DSC06106.jpg";
  return client_ssh_sftp.fastPut(localFile, remoteFile);
}).then(() => {
  console.log("執行到這end");
  console.log(test_v);
  return client_ssh_sftp.end();
}).catch(err => {
  console.log("這裡");
  console.log(err);
  console.log("這裡2");
});
console.log("123");

client_ssh_sftp.connect({
  host: CONFIG.appenv.storage.scp.ip,
  port: 22,
  username: CONFIG.appenv.storage.scp.user,
  password: CONFIG.appenv.storage.scp.password
}).then(() => {
  console.log(test_v2);
  let remoteDir = CONFIG.path.project + "/for_test/abc/b";
  return client_ssh_sftp.mkdir(remoteDir, true);
}).then(() => {
  console.log(test_v2);
  let localFile = CONFIG.path.project + "/for_test/file.txt";
  let remoteFile = CONFIG.path.project + "/for_test/abc/b/file.txt";
  return client_ssh_sftp.fastPut(localFile, remoteFile);
}).then(() => {
  console.log("執行到這end2");
  console.log(test_v2);
  return client_ssh_sftp.end();
}).catch(err => {
  console.log("這裡3");
  console.log(err);
  console.log("這裡4");
});
console.log("456");
