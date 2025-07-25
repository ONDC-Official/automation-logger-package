require("dotenv").config();
import clc from "cli-color";
import { isAxiosError } from "axios";
import { createLogger } from "./winston/logger";
import winston from "winston";
import { correlationIdMiddleware } from "./middleware/correclation-middleware";
import { test } from "./test";
import { console } from "inspector";
class AutomationLogger {
	private static instance: AutomationLogger | undefined;
	private logger: winston.Logger;
	loggingColors: {
		info: string;
		error: string;
		debug: string;
		warning: string;
	} = {
		info: clc.green("[INFO]"),
		error: clc.red("[ERROR]"),
		debug: clc.blue("[DEBUG]"),
		warning: clc.yellow("[WARNING]"),
	};
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
		args = args.map((arg, index) => {
			if (typeof arg === "string") {
				return { [`message_${index + 2}`]: arg };
			}
			return arg;
		});
		message = this.getFormattedMessage(message, "info", ...args);
		this.logger.info(message, ...args);
	}

	error(message: string, meta?: any, error?: Error) {
		message = this.getFormattedMessage(message, "error", meta);
		if (isAxiosError(error)) {
			this.logger.error(message, {
				// By including the error's stack, you ensure it gets logged correctly
				stack: error.stack,

				// Add rich, structured context from the Axios error
				axios_error: {
					code: error.code, // e.g., 'ECONNABORTED', 'ERR_BAD_REQUEST'
					request: {
						method: error.config?.method,
						url: error.config?.url,
					},
					response: {
						status: error.response?.status,
						statusText: error.response?.statusText,
						data: error.response?.data,
					},
				},
			});
			return;
		}
		this.logger.error(message, {
			error: error ? error.message : "No error provided",
			stack: error ? error.stack : "No stack trace available",
			...meta,
		});
	}

	debug(message: string, ...args: any[]) {
		args = args.map((arg, index) => {
			if (typeof arg === "string") {
				return { [`debug_${index + 1}`]: arg };
			}
			return arg;
		});
		message = this.getFormattedMessage(message, "debug", ...args);
		this.logger.debug(message, ...args);
	}

	warning(message: string, ...args: any[]) {
		args = args.map((arg, index) => {
			if (typeof arg === "string") {
				return { [`warning_${index + 1}`]: arg };
			}
			return arg;
		});
		message = this.getFormattedMessage(message, "warning", ...args);
		this.logger.warn(message, ...args);
	}

	startTimer(): winston.Profiler {
		return this.logger.startTimer();
	}

	getCorrelationIdMiddleware() {
		return correlationIdMiddleware;
	}

	getFormattedMessage(
		message: string,
		level: "info" | "error" | "debug" | "warning",
		...args: any[]
	): string {
		let correlationId =
			args.find((arg) => typeof arg === "object" && arg.correlationId)
				?.correlationId || undefined;
		if (typeof correlationId === "string") {
			correlationId = clc.magenta(`[C-ID: ${correlationId}]`);
		}
		message = `${this.loggingColors[level]} ${
			correlationId ? `${correlationId}` : ""
		} ${message}`;
		return message;
	}
}

export default AutomationLogger.getInstance();

test();
