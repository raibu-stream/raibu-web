import { error } from '@sveltejs/kit';
import { auth, db } from '$lib/models/db';
import { verifyEmailVerificationCode } from '$lib/models/emailVerificationCode';
import type { RequestEvent, RequestHandler } from './$types';
import { timeOut } from '$lib/models/schema';
import { eq } from 'drizzle-orm';

export const POST: RequestHandler = async ({ request, locals }: RequestEvent) => {
	let session = await locals.auth.validate();
	if (!session) {
		error(401);
	}

	const timeout = await db.query.timeOut.findFirst({
		where: eq(timeOut.timerId, session.user.userId)
	});
	if (timeout !== undefined) {
		error(400, { message: `You cannot attempt to verify your account for the next minute` });
	}

	const formData = await request.json();
	const code = formData.code;
	await verifyEmailVerificationCode(code, session.user);

	let sessionCookie;

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


	return new Response(undefined, {
		status: 200,
		headers: {
			'Set-Cookie': sessionCookie.serialize()
		}
	});
};
