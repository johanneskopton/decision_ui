import * as winston from "winston";

export const format = winston.format.combine(
    winston.format.timestamp(),
    winston.format.colorize(),
    winston.format.printf((info) => {
      const { timestamp, level, message, ...args } = info; // eslint-disable-line
      return `[${level}] ${message} ${Object.keys(args).length ? JSON.stringify(args, null, 2) : ""}`;
    }),
);

export const logger = winston.createLogger({
    transports: [
        new winston.transports.Console({
            format,
        }),
    ],
});

export const setLevel = (level: string) => {
    logger.transports[0].level = level;
};
