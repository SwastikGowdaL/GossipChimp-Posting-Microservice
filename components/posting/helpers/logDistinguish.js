const logger = require('../logger');

const logDistinguish = async (logDetails) => {
  switch (logDetails.logLevel) {
    case 'info':
      logger.info(logDetails.logMessage, logDetails.logMetaData);
      break;
    case 'warn':
      logger.warn(logDetails.logMessage, logDetails.logMetaData);
      break;
    case 'error':
      logger.error(logDetails.logMessage, logDetails.logMetaData);
      break;
    default:
      break;
  }
};

module.exports = logDistinguish;
