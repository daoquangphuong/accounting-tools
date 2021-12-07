const check = require('../models/check');

module.exports = async function compare(req, res, next) {
  try {
    const result = await check.compare();
    next(result);
  } catch (e) {
    next(e);
  }
};
