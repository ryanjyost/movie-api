const appRoot = require("app-root-path");
const winston = require("winston");
const { format } = winston;

const options = {
  file: {
    // level: process.env.NODE_ENV !== "production" ? "error" : "info",
    level: "info",
    filename: `${appRoot}/logs/app.log`,
    handleExceptions: true,
    json: true,
    maxsize: 5242880, // 5MB
    maxFiles: 5,
    colorize: false
  },
  console: {
    level: "warning",
    format: format.combine(format.colorize(), format.simple())
  }
};

const logger = winston.createLogger({
  format: format.combine(
    format.timestamp({
      format: "YYYY-MM-DD HH:mm:ss"
    }),
    format.errors({ stack: true }),
    format.splat(),
    format.json()
  ),
  transports: [new winston.transports.File(options.file)],
  exitOnError: false // do not exit on handled exceptions
});

if (process.env.NODE_ENV !== "production") {
  logger.add(new winston.transports.Console(options.console));
}

logger.stream = {
  write: function(message, encoding) {
    logger.info(message);
  }
};

module.exports = logger;
