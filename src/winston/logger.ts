// import { loggerFormat } from "./format";
import loggerTransports from "./transports";
import winston from "winston";
import { devFormat, lokiFormat } from "./format";
import getLoggerTransports from "./transports";
export interface LoggerConfig {
	serviceName: string;
}

export function createLogger({ serviceName }: LoggerConfig) {
	if (!serviceName) {
		throw new Error("Service name is required to create a logger.");
	}
	// Determine which format and transports to use based on the environment
	const isProduction = process.env.NODE_ENV === "production";
	console.log(
		`Logger is running in ${isProduction ? "production" : "development"} mode.`
	);
	const format = isProduction ? lokiFormat : devFormat;

	return winston.createLogger({
		level: process.env.LOG_LEVEL || "info",
		defaultMeta: {
			labels: {
				service: serviceName,
				category: "automation-framework",
			},
		},
		transports: getLoggerTransports(),
		exitOnError: false,
		format: format,
	});
}
