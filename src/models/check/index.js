const fileMap = {
  kho: null,
  kt: null,
};

const compare = async () => {
  if (!fileMap.kho) {
    throw new Error('Not found Kho Data');
  }
  if (!fileMap.kt) {
    throw new Error('Not found Kt Data');
  }
  return true;
};

module.exports = {
  fileMap,
  compare,
};
