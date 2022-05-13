const fileMap = require('./fileMap');
const name = require('./name');
const qc = require('./name');

const compare = async type => {
  if (type === 'name') {
    return name.compare();
  }
  return qc.compare();
};

module.exports = {
  fileMap,
  compare,
};
