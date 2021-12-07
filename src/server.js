if (process.env.NODE_ENV === 'production') {
  // eslint-disable-next-line global-require
  require('source-map-support').install();
}
const express = require('express');
const cors = require('cors');
const routes = require('./routes');
const config = require('./config');
const html = require('./html');

const app = express();

app.get('/', (req, res) => {
  res.end(html);
});

app.use('/accounting', cors(), routes);

app.listen(config.port, () => {
  if (process.env.NODE_ENV !== 'production') {
    console.info(
      `You can now view accounting-tools in the browser. \n\n http://localhost:${config.port} \n`
    );
    return;
  }
  console.info(
    `
---------------------------------------------------------
[           Accounting Tools is now running.            ]
[                                                       ]
[            http://localhost:${config.port}             ]
---------------------------------------------------------
  `
  );
});
