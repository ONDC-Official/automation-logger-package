import logger from "../index";

export function test() {
	logger.info(
		"This is an info message from the test index file.",
		"test-index",
		{
			stuff: "test-stuff",
			nested: {
				inner: "test-inner",
				more: {
					deeper: "test-deeper",
				},
			},
			correlationId: "test-correlation-id",
		},
		JSON.stringify(
			{
				stuff: "test-stuff",
				nested: {
					inner: "test-inner",
					more: {
						deeper: "test-deeper",
					},
				},
			},
			null,
			2
		)
	);

	logger.error(
		"This is an error message from the test index file.",
		{
			errorInfo: "test-error-info",
			reqId: "test-request-id",
		},
		new Error("Test error")
	);

	logger.debug(
		"This is a debug message from the test index file.",
		{
			debugInfo: "test-debug-info",
		},
		"additional-debug-info",
		"more-debug-info",
		{
			extra: "test-extra-info",
			testing: {
				nested: "test-nested-info",
			},
		}
	);

	logger.info("This is a simple info message with dirty args.", undefined, {
		test: null,
		ha: undefined,
	});

	async function testLogging() {
		const profiler = logger.startTimer();
		setTimeout(function () {
			profiler.done({ message: "Logging message", corrId: "12345" });
		}, 1000);
	}

	(async function () {
		await testLogging();
		logger.warning(
			"This is a warning message from the test index file.",
			"test-warning",
			{
				warningInfo: "test-warning-info",
			}
		);
	})();
}
