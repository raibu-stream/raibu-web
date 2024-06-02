import { dev } from '$app/environment';
import { auth, db } from '$lib/models/db';
import { errorLog, requestLog } from '$lib/models/schema';
import { FRIENDLY_ERROR_MESSAGE } from '$lib/utils';
import { TimeSpan, createDate } from 'oslo';

export const handle = async ({ event, resolve }) => {
	const sessionId = event.cookies.get(auth.sessionCookieName);
	if (sessionId === undefined) {
		event.locals.user = null;
		event.locals.session = null;
		return resolve(event);
	}

	const { session, user } = await auth.validateSession(sessionId);
	if (session !== null && session.fresh) {
		const sessionCookie = auth.createSessionCookie(session.id);
		event.cookies.set(sessionCookie.name, sessionCookie.value, {
			path: '.',
			...sessionCookie.attributes
		});
	}
	if (session === null) {
		const sessionCookie = auth.createBlankSessionCookie();
		event.cookies.set(sessionCookie.name, sessionCookie.value, {
			path: '.',
			...sessionCookie.attributes
		});
	}
	event.locals.user = user;
	event.locals.session = session;

	const startTime = process.hrtime.bigint();
	const response = await resolve(event);
	const durationInNs = process.hrtime.bigint() - startTime;

	if (event.route.id !== null) {
		(async () => {
			try {
				await db.insert(requestLog).values({
					routeId: event.route.id!,
					requestMethod: event.request.method,
					latencyInNs: durationInNs,
					expires: createDate(new TimeSpan(30, 'd')),
					user: user?.id
				});
			} catch (err) {
				await arbitraryHandleError(err);
			}
		})().catch((err) => arbitraryHandleError(err));
	}

	return response;
};

export const handleError = async ({ error, status }) => {
	if (dev) {
		console.error(error);
	}

	if (status === 404) {
		return {
			message: 'This page does not exist.'
		};
	}

	return await arbitraryHandleError(error, false);
};

export const arbitraryHandleError = async (error: unknown, devPrint: boolean = true) => {
	if (devPrint && dev) {
		console.error(error);
	}

	const errorId = crypto.randomUUID();

	await db
		.insert(errorLog)
		.values({
			error:
				typeof error !== 'string'
					? JSON.stringify(error, Object.getOwnPropertyNames(error))
					: error,
			errorId,
			expires: createDate(new TimeSpan(30, 'd'))
		})
		.catch((e) => console.error(e));

	return {
		message: FRIENDLY_ERROR_MESSAGE,
		errorId
	};
};
