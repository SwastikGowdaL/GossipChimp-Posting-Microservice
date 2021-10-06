const DatadogWinston = require('datadog-winston');

const { createLogger, format, transports } = require('winston');

const { combine, timestamp, label, json } = format;

const config = require('../../../config/config');

// custom logger
const buildDevLogger = () => {
  const logger = createLogger({
    format: combine(
      label({
        label: 'Dev-logger',
      }),
      timestamp({
        format: 'DD-MM-YYYY HH:mm:ss',
      }),
      format.errors({
        stack: true,
      }),
      json()
    ),
    level: 'silly',
    transports: [],
  });

  logger.add(
    new DatadogWinston({
      apiKey: config.DATA_DOG_API_KEY,
      hostname: config.DATA_DOG_HOSTNAME,
      service: config.DATA_DOG_SERVICE,
      ddsource: config.DATA_DOG_DDSOURCE,
    })
  );

  return logger;
};
module.exports = buildDevLogger;
