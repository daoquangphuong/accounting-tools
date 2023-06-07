const fileMap = require('./fileMap');
const name = require('./name');
const qc = require('./qc');

const compare = async (type, opts) => {
  if (type === 'name') {
    return name.compare(opts);
  }
  return qc.compare(opts);
};

module.exports = {
  fileMap,
  compare,
};
