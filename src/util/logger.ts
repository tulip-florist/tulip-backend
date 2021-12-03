import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";
import WinstonSentry from "winston-sentry-log";

const options = {
  file: {
    filename: "./logs/app-%DATE%.log",
    datePattern: "YYYY-MM-DD-HH",
    frequency: "24h",
    zippedArchive: true,
    maxSize: "20m",
    maxFiles: "14d",
    level: process.env.LOG_LEVEL_FILE,
  },
  console: {
    level: process.env.LOG_LEVEL_CONSOLE,
  },
  sentry: {
    config: {
      dsn: process.env.SENTRY_DNS,
      tracesSampleRate: (() => {
        if (process.env.NODE_ENV === "production") {
          return 0.5;
        } else {
          return 1.0;
        }
      })(),
    },
    level: "warn",
  },
  exception: {
    filename: "./logs/exceptions.log",
  },
};

const format = winston.format.combine(
  winston.format.timestamp({
    format: "YYYY-MM-DD HH:mm:ss",
  }),
  winston.format.simple()
);

const logger = winston.createLogger({
  levels: winston.config.npm.levels,
  format,
  transports: [
    new DailyRotateFile(options.file),
    new winston.transports.Console(options.console),
    new WinstonSentry(options.sentry),
  ],
  exceptionHandlers: [new winston.transports.File(options.exception)],
  exitOnError: false,
});

export default logger;
