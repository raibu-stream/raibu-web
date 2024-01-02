import { error } from '@sveltejs/kit';
import { auth } from '$lib/models/db';
import { verifyEmailVerificationCode } from '$lib/models/emailVerificationCode';
import type { RequestEvent, RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, locals }: RequestEvent) => {
	let session = await locals.auth.validate();
	if (!session) {
		throw error(401);
	}

	const formData = await request.json();
	const code = formData.code;
	await verifyEmailVerificationCode(code, session.user);

	let sessionCookie;
	try {
		await auth.invalidateAllUserSessions(session.user.userId);

		await auth.updateUserAttributes(session.user.userId, {
			is_email_verified: true
		});

		session = await auth.createSession({
			userId: session.user.userId,
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
		status: 200,
		headers: {
			'Set-Cookie': sessionCookie.serialize()
		}
	});
};
