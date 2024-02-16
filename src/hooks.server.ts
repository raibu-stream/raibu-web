import { dev } from '$app/environment';
import { auth, db } from '$lib/models/db';
import { errorLog, requestLog } from '$lib/models/schema';

const THIRTY_DAYS_IN_MS = 1000 * 60 * 60 * 24 * 30;

export const handle = async ({ event, resolve }) => {
	event.locals.auth = auth.handleRequest(event);

	const session = event.locals.auth.validate();
	const startTime = process.hrtime.bigint();
	const response = await resolve(event);
	const durationInNs = process.hrtime.bigint() - startTime;

	if (event.route.id !== null) {
		session
			.then((session) => {
				return db.insert(requestLog).values({
					routeId: event.route.id!,
					requestMethod: event.request.method,
					latencyInNs: durationInNs,
					expires: new Date().getTime() + THIRTY_DAYS_IN_MS,
					userId: session?.user?.userId
				});
			})
			.catch((e) => console.error(e));
	}

	return response;
};

export const handleError = async ({ error }) => {
	if (dev) {
		console.error(error);
	}

	if (isNotFoundError(error)) {
		return {
			message: 'This page does not exist.'
		};
	}

	const errorId = crypto.randomUUID();

	db.insert(errorLog)
		.values({
			error: typeof error !== 'string' ? JSON.stringify(error) : error,
			errorId,
			expires: new Date().getTime() + THIRTY_DAYS_IN_MS
		})
		.catch((e) => console.error(e));

	return {
		message: 'An unexpected error occurred.',
		errorId
	};
};

const isNotFoundError = (error: any): boolean => {
	return 'stack' in error && error.stack.startsWith('Error: Not found:');
};
