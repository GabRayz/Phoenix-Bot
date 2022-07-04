import { createLogger, format, transports } from "winston";

const myFormat = format.printf(({ level, message, timestamp, label }) => {
    return `[${timestamp}] [${level}] [${label}] - ${message}`;
});

const logger = createLogger({
    level: "silly",
    transports: [
        new transports.Console({
            format: format.combine(format.colorize(), myFormat),
        }),
        new transports.File({ filename: "./logs/phoenix.log" }),
    ],
    format: format.combine(
        format.timestamp(),
        format.metadata({
            fillExcept: ["message", "level", "timestamp", "label"],
        }),
        myFormat
    ),
});

export default logger;
