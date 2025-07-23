import { loggerFormat } from "./format";
import loggerTransports from "./transports";
import winston from "winston";

export interface LoggerConfig {
	serviceName: string;
}

export function createLogger({ serviceName }: LoggerConfig) {
	if (!serviceName) {
		throw new Error("Service name is required to create a logger.");
	}
	return winston.createLogger({
		level: process.env.LOG_LEVEL || "info",
		defaultMeta: {
			labels: {
				service: serviceName,
			},
		},
		transports: loggerTransports,
		exitOnError: false,
		format: loggerFormat,
	});
}
