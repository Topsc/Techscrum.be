export {};
const winston = require('winston');
const { format, createLogger } = require('winston');
const { timestamp, combine, align, printf } = format;
const path = require('path');

function buildProdLogger(): any {
  return createLogger({
    format: combine(
      timestamp({
        format: 'YYYY-MM-DD hh:mm:ss A',
      }),
      align(),
      printf((info: any) => `[${info.timestamp}] ${info.level}: ${info.message}`),
    ),
    transports: [
      new winston.transports.File({
        filename: path.join('storage/logs', '/logger.log'),
      }),
    ],
  });
}

module.exports = buildProdLogger;
