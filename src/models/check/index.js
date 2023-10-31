const fileMap = require('./fileMap');
const name = require('./name');
const qc = require('./qc');
const tkXuat = require('./tk-xuat');

const compare = async (type, opts) => {
  if (type === 'name') {
    return name.compare(opts);
  }
  return qc.compare(opts);
};

const analytic = async (type, opts) => {
  if (type === 'xuat') {
    return tkXuat.analytic(opts);
  }
  return 'qc.compare(opts);';
};

module.exports = {
  fileMap,
  compare,
  analytic,
};
