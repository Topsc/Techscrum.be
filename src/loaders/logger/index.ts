export {};
const buildDevLogger = require('./winston/devLogger');
const buildProdLogger = require('./winston/prodLogger');

let logger: any = null;
if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'dev') {
  logger = buildDevLogger();
} else {
  logger = buildProdLogger();
}

module.exports = logger;
