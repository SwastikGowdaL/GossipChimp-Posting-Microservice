const buildDevLogger = require('./dev-logger');
const buildProdLogger = require('./prod-logger');
const config = require('../../../config/config');

let logger = null;
if (config.LOG === 'PROD') {
  logger = buildProdLogger();
} else {
  logger = buildDevLogger();
}

module.exports = logger;
