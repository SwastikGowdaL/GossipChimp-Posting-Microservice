const { createLogger, format, transports } = require('winston');

const { combine, timestamp, label, json } = format;

const DatadogWinston = require('datadog-winston');

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
      apiKey: '8c50c3a0b49485e943dba6a5a4b7c1a6',
      hostname: 'DESKTOP-9OHGML6',
      service: 'gossipChimp posting Microservice',
      ddsource: 'nodejs',
    })
  );

  return logger;
};
module.exports = buildDevLogger;
