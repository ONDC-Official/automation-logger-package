export interface WorkbenchLog {
	correlationId: string;
	message: string;
	transactionId?: string;
	sessionId?: string;
	subscriberUrl?: string;
	subscriberId?: string;
	error?: {
		message: string;
		stack?: string;
	};
}
