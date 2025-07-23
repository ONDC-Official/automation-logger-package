import winston from "winston";
import "winston-loki";
import { inspect } from "util";

// Destructure format from winston
const {
	combine,
	timestamp,
	printf,
	colorize,
	errors,
	splat,
	json,
	prettyPrint,
} = winston.format;

// Define custom colors for log levels
const customColors = {
	error: "red",
	warn: "yellow",
	info: "green",
	http: "magenta",
	debug: "white",
};

winston.addColors(customColors);

/**
 * -----------------------------------------------------------------------
 * Development Logger Format
 * -----------------------------------------------------------------------
 * This format is designed for maximum readability during local development.
 * - Colorized output to quickly identify log levels.
 * - Timestamp for tracking when events occurred.
 * - Full stack traces for errors.
 * - Pretty-prints objects and arrays for easy inspection.
 */
export const devFormat = combine(
	colorize({ all: true }),
	timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
	splat(),
	errors({ stack: true }),
	printf((info) => {
		const { timestamp, level, message, stack, ...meta } = info;
		const metaString = Object.entries(meta)
			.map(([key, value]) => {
				if (typeof value === "object") {
					return `${key}: ${inspect(value, { colors: true, depth: Infinity })}`;
				}
				return `${key}: ${value}`;
			})
			.join("\n");
		// Handle errors with stack traces
		if (stack) {
			return `----------\n${timestamp} ${level}: ${message}\n${metaString}\n${stack}`;
		}

		return `----------\n${timestamp} ${level}: ${message}\n${metaString}`;
	})
);

export const lokiFormat = combine(
	timestamp(),
	splat(),
	json(),
	prettyPrint(),
	errors({ stack: true })
);
