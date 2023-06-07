const check = require('../models/check');

module.exports = async function compare(req, res, next) {
  try {
    const result = await check.compare(req.query.compareType, {
      khoFont: !!req.query.khoFont,
      ktFont: !!req.query.ktFont,
    });
    next(result);
  } catch (e) {
    next(e);
  }
};
