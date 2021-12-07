const path = require('path');
const os = require('os');
const fs = require('fs');

const isDEV = process.env.NODE_ENV !== 'production';

const CWD = isDEV
  ? path.resolve(__dirname, '../../tmp/accounting')
  : path.resolve(fs.existsSync('/tmp') ? '/tmp' : os.tmpdir(), 'accounting');

if (!fs.existsSync(CWD)) {
  fs.mkdirSync(CWD);
}

module.exports = {
  isDEV,
  cwd: CWD,
  serverFile: isDEV
    ? path.resolve(__dirname, '../server.js')
    : path.resolve(CWD, 'server.js'),
  port: 10888,
};
