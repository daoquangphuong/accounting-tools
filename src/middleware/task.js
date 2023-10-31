const check = require('../models/check');

module.exports = async function task(req, res, next) {
  try {
    switch (req.query.app) {
      case '1': {
        const result = await check.compare(req.query.type, {
          khoFont: !!req.query.khoFont,
          ktFont: !!req.query.ktFont,
        });
        next(result);
        break;
      }
      case '2': {
        const result = await check.analytic(req.query.type, {});
        next(result);
        break;
      }
      default: {
        throw new Error('Not found APP');
      }
    }
  } catch (e) {
    next(e);
  }
};
