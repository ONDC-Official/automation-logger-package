import winston, { transports } from "winston";
import LokiTransport from "winston-loki"; // Import the Loki transport
import { loggerFormat, lokiFormat } from "./format";

// Determine the environment
const isProduction = process.env.NODE_ENV === "production";

// Create transports based on the environment
const loggerTransports: winston.transport[] = [];

if (isProduction) {
	// For production, log structured JSON to the console
	loggerTransports.push(new transports.Console({ format: lokiFormat }));

	// --> ADD THIS BLOCK FOR LOKI <--
	// Send logs to Grafana Loki in production
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

			// Handle connection errors
			onConnectionError: (err) =>
				console.error("Error connecting to Loki:", err),
		})
	);
	// --> END OF LOKI BLOCK <--
} else {
	// For development, use the pretty, colorized format
	loggerTransports.push(new transports.Console({ format: loggerFormat }));
}

export default loggerTransports;
