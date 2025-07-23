import winston, { format } from "winston";
const { combine, timestamp, json, errors, splat, prettyPrint, cli, colorize } =
	winston.format;

export const loggerFormat = combine(
	timestamp(),
	splat(),
	json(),
	prettyPrint(),
	errors({ stack: true })
);

export const lokiFormat = combine(
	timestamp(),
	splat(),
	json(),
	prettyPrint(),
	errors({ stack: true })
);
