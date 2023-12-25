import { error } from '@sveltejs/kit';
import { auth } from '$lib/models/db';
import { verifyTooManyLoginsToken } from '$lib/models/tooManyLoginsToken';
import type { RequestEvent, RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params, locals }: RequestEvent) => {
	const token = params.token;
	const user = await verifyTooManyLoginsToken(token);
	let sessionCookie;

	try {
		await auth.invalidateAllUserSessions(user.userId);

		await auth.updateUserAttributes(user.userId, {
			isLocked: false
		});

		const session = await auth.createSession({
			userId: user.userId,
			attributes: {}
		});
		sessionCookie = auth.createSessionCookie(session);
		locals.auth.setSession(session);
	} catch (e) {
		console.error(e);
		throw error(500, {
			message: 'An unknown error occurred'
		});
	}

	return new Response(undefined, {
		status: 302,
		headers: {
			Location: '/user',
			'Set-Cookie': sessionCookie.serialize()
		}
	});
};