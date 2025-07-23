# Automation Logger Package

A robust, structured logging utility for Node.js applications, designed for the ONDC ecosystem and beyond. The Automation Logger Package provides a consistent API for logging across environments, with native support for Grafana Loki in production and developer-friendly, colorized logs in development.

## Features

- **Singleton Logger Instance:** Ensures a single logger instance throughout your application.
- **Multiple Log Levels:** Supports `info`, `error`, `debug`, and `warning` with structured arguments.
- **Axios Error Handling:** Special support for logging detailed Axios errors (request, response, code, stack).
- **Environment-Aware:** Adapts output and transports based on `NODE_ENV`—pretty console output in development, Loki JSON in production.
- **Correlation Middleware:** Express middleware to attach/request a correlation ID for traceability.
- **Profiler:** Timer/profiler utility for measuring durations of code execution.
- **Extensible:** Built on top of [winston](https://github.com/winstonjs/winston) with support for custom transports and formats.

## Installation

```bash
npm install @ondc/automation-logger-package
```

## Usage

### Basic Logging

```typescript
import logger from "@ondc/automation-logger-package";

logger.info("Service started", { user: "alice" });
logger.error("Failed to process request", new Error("Something went wrong"));
logger.debug("Debug message", { debugInfo: "details" });
logger.warning("Potential issue detected", { details: "..." });
```

### Profiling Code

```typescript
const profiler = logger.startTimer();
// ... your code
profiler.done({ message: "Finished task", corrId: "abc123" });
```

### Express Correlation Middleware

To add a correlation ID to every incoming request:

```typescript
import { correlationIdMiddleware } from "@ondc/automation-logger-package/dist/middleware/correclation-middleware";
app.use(correlationIdMiddleware);
```

## Environment Variables

- `SERVICE_NAME` (required): Sets the service label for logs.
- `NODE_ENV` (required): Should be `production` or `development`.
- `LOG_LEVEL`: Log level (`info`, `debug`, etc.). Defaults to `info`.
- `LOKI_HOST`: URL for Grafana Loki (required in production for remote logging).

## Example

```typescript
import logger from "@ondc/automation-logger-package";

logger.info("Application started", "extraContext");
logger.error("API call failed", new Error("Bad request"));
```

## Development & Testing

- Colorized, human-readable logs in development.
- Structured, JSON logs for Loki in production.

## License

See [LICENSE](LICENSE) for details.

---

> For more, see the [repository](https://github.com/ONDC-Official/automation-logger-package)
