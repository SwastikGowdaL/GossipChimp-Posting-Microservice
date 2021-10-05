const { createLogger, format, transports } = require('winston');

const { combine, timestamp, label, printf, json, prettyPrint } = format;

const logFormat = printf(
  // eslint-disable-next-line no-shadow
  ({ level, message, timestamp, stack, metaData, abstractionLevel }) =>
    `${level}: ${
      stack || message
    } \n abstraction-level : ${abstractionLevel} \n meta-data : ${metaData} \n ${timestamp}`
);

// custom logger
const buildDevLogger = () =>
  createLogger({
    format: combine(
      format.colorize(),
      label({
        label: 'Dev-logger',
      }),
      timestamp({
        format: 'DD-MM-YYYY HH:mm:ss',
      }),
      format.errors({
        stack: true,
      }),
      logFormat
    ),
    level: 'silly',
    transports: [
      new transports.Console({
        level: 'silly',
      }),
    ],
  });

module.exports = buildDevLogger;
