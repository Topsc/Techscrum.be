const expressLoader = require('./express');
const serverLoader = require('./server');
const mongooseLoader = require('./mongoose');

exports.init = () => {
  const app = expressLoader();
  serverLoader(app);
  mongooseLoader();
};
