import { createLogger } from "./winston/logger";
import winston from "winston";
require("dotenv").config();
class AutomationLogger {
	private static instance: AutomationLogger | undefined;
	private logger: winston.Logger;
	constructor() {
		AutomationLogger.instance = this;
		if (!process.env.SERVICE_NAME) {
			console.warn(
				"SERVICE_NAME environment variable is not set. Defaulting to 'default-service'. This may lead to confusion in log aggregation. \n"
			);
		}
		if (!process.env.LOG_LEVEL) {
			console.warn(
				"LOG_LEVEL environment variable is not set. Defaulting to 'info'. This may lead to missing debug logs. \n"
			);
		}
		if (!process.env.NODE_ENV) {
			throw new Error(
				"NODE_ENV environment variable is not set. This is required to determine the logging environment. \n"
			);
		}
		if (process.env.NODE_ENV !== "production") {
			console.warn(
				"Running in non-production environment. Logs may not be sent to Grafana Loki. \n"
			);
		}
		if (!process.env.LOKI_HOST) {
			console.warn(
				"LOKI_HOST environment variable is not set. Logs will not be sent to Grafana Loki. \n"
			);
		}
		this.logger = createLogger({
			serviceName: process.env.SERVICE_NAME || "default-service",
		});
	}
	static getInstance(): AutomationLogger {
		if (!AutomationLogger.instance) {
			AutomationLogger.instance = new AutomationLogger();
		}
		return AutomationLogger.instance;
	}
	info(message: string, ...args: any[]) {
		// change strings to message_{index} format
		args = args.map((arg, index) => {
			if (typeof arg === "string") {
				return { [`message_${index + 2}`]: arg };
			}
			return arg;
		});

		this.logger.info(message, ...args);
	}

	error(message: string, error?: Error) {
		this.logger.error(message, error);
	}

	debug(message: string, ...args: any[]) {
		args = args.map((arg, index) => {
			if (typeof arg === "string") {
				return { [`debug_${index + 1}`]: arg };
			}
			return arg;
		});
		this.logger.debug(message, ...args);
	}

	warning(message: string, ...args: any[]) {
		args = args.map((arg, index) => {
			if (typeof arg === "string") {
				return { [`warning_${index + 1}`]: arg };
			}
			return arg;
		});
		this.logger.warn(message, ...args);
	}

	startTimer(): winston.Profiler {
		return this.logger.startTimer();
	}
}

export default AutomationLogger.getInstance();
