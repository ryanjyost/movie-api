const appRoot = require("app-root-path");
const winston = require("winston");
const { format } = winston;

const options = {
  file: {
    level: "info",
    filename: `${appRoot}/logs/app.log`,
    handleExceptions: true,
    json: true,
    maxsize: 5242880, // 5MB
    maxFiles: 5,
    colorize: false
  },
  console: {
    level: "debug",
    handleExceptions: true,
    json: false,
    format: format.combine(
      format.colorize(),
      format.simple(),
      format.printf(
        info =>
          process.env.ENV === "development"
            ? `${info.level}: ${info.message}`
            : `${info.timestamp} ${info.level}: ${info.message}`
      )
    )
  }
};

const logger = winston.createLogger({
  format: format.combine(
    format.timestamp({
      format: "MM/DD/YY HH:mm:ss"
    }),
    format.errors({ stack: true }),
    format.splat(),
    format.json()
  ),
  // format: format.simple(),

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
