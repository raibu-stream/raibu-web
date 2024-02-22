import { error } from '@sveltejs/kit';
import { newEmailVerificationCode } from '$lib/models/emailVerificationCode';
import type { RequestEvent, RequestHandler } from './$types';
import { db } from '$lib/models/db';
import { eq } from 'drizzle-orm';
import { timeOut } from '$lib/models/schema';
import { TimeSpan, createDate } from 'oslo';

const TIMEOUT_DISCRIMINATOR = 'emailverifycode';

export const POST: RequestHandler = async ({ locals }: RequestEvent) => {
	if (locals.user === null) {
		error(401, {
			message: 'You are not logged in'
		});
	}

	const timeout = await db.query.timeOut.findFirst({
		where: eq(timeOut.timerId, locals.user.id + TIMEOUT_DISCRIMINATOR)
	});
	if (timeout !== undefined) {
		error(400, { message: `You cannot send another email for the next minute` });
	}
	if (locals.user.isEmailVerified) {
		error(400, { message: 'You are already verified' });
	}

	await newEmailVerificationCode(locals.user);

	await db.insert(timeOut).values({
		timerId: locals.user.id + TIMEOUT_DISCRIMINATOR,
		expires: createDate(new TimeSpan(1, 'm'))
	});

	return new Response(JSON.stringify(undefined), {
		status: 200
	});
};
