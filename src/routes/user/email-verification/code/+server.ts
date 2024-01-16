import { error } from '@sveltejs/kit';
import { newEmailVerificationCode } from '$lib/models/emailVerificationCode';
import type { RequestEvent, RequestHandler } from './$types';
import { db } from '$lib/models/db';
import { eq } from 'drizzle-orm';
import { timeOut } from '$lib/models/schema';

const ONE_MINUTE_IN_MS = 1000 * 60;

export const POST: RequestHandler = async ({ locals }: RequestEvent) => {
	const session = await locals.auth.validate();

	if (!session) {
		throw error(401, {
			message: 'You are not logged in'
		});
	}

	const timeout = await db.query.timeOut.findFirst({
		where: eq(timeOut.timerId, session.user.userId)
	});
	if (timeout !== undefined) {
		throw error(400, { message: `You cannot send another email for the next minute` });
	}
	if (session.user.isEmailVerified) {
		throw error(400, { message: 'You are already verified' });
	}

	try {
		await newEmailVerificationCode(session.user);
	} catch (e) {
		throw error(500, {
			message: 'An unknown error occurred'
		});
	}

	await db.insert(timeOut).values({
		timerId: session.user.userId,
		expires: new Date().getTime() + ONE_MINUTE_IN_MS
	});

	return new Response(JSON.stringify(undefined), {
		status: 200
	});
};
