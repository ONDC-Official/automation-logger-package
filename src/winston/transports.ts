import winston, { transports } from "winston";
import LokiTransport from "winston-loki"; // Import the Loki transport
import { devFormat, lokiFormat } from "./format";

export default function getLoggerTransports(): winston.transport[] {
	// Determine the environment
	const isProduction = process.env.NODE_ENV === "production";

	// Create transports based on the environment
	const loggerTransports: winston.transport[] = [];

	if (isProduction) {
		loggerTransports.push(new transports.Console({ format: lokiFormat }));
		loggerTransports.push(
			new LokiTransport({
				// URL of your Grafana Loki instance
				host: process.env.LOKI_HOST || "http://localhost:3100",
				// Crucial: Send logs as JSON for parsing
				json: true,
				// Format must also be JSON
				format: winston.format.json(),
				// Replace the timestamp to ensure Loki accepts it
				replaceTimestamp: true,
				onConnectionError: (err) =>
					console.error("Error connecting to Loki:", err),
			})
		);
	} else {
		loggerTransports.push(new transports.Console({ format: devFormat }));
	}
	return loggerTransports;
}
