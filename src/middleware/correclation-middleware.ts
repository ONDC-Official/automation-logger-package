import { Request, Response, NextFunction } from "express";

const CORRELATION_ID_HEADER = "X-Request-ID";

// This is called "Declaration Merging".
// It tells TypeScript that our version of the Express Request object
// will have an optional `correlationId` property.
declare global {
	namespace Express {
		export interface Request {
			correlationId?: string;
		}
	}
}

export function correlationIdMiddleware(
	req: Request,
	res: Response,
	next: NextFunction
): void {
	const id = req.get(CORRELATION_ID_HEADER) || nanoid();
	req.correlationId = id;
	res.set(CORRELATION_ID_HEADER, id);
	next();
}

function nanoid(): string {
	// Simple nanoid implementation for generating unique IDs
	return (
		Math.random().toString(36).substring(2, 15) +
		Math.random().toString(36).substring(2, 15)
	);
}
