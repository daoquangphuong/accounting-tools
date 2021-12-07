const express = require('express');
const bodyParser = require('body-parser');
const delay = require('../middleware/delay');
const ping = require('../middleware/ping');
const error = require('../middleware/error');
const json = require('../middleware/json');
const update = require('../middleware/update');

const router = express.Router();

if (process.env.NODE_ENV !== 'production') {
  router.use(delay());
}

router.use('/ping', ping);

router.use(json('before'));

router.use(bodyParser.urlencoded({ extended: true }));

router.use(bodyParser.json());

router.use(json('after'));

router.post('/post/update', update);

// error handler
router.use(error);

module.exports = router;
