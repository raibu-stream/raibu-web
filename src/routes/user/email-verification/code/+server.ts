import { error } from '@sveltejs/kit';
import { newEmailVerificationCode } from '$lib/models/emailVerificationCode';
import type { RequestEvent, RequestHandler } from './$types';
import { db } from '$lib/models/db';
import { eq } from 'drizzle-orm';
import { timeOut } from '$lib/models/schema';
import { TimeSpan, createDate, isWithinExpirationDate } from 'oslo';

const TIMEOUT_DISCRIMINATOR = 'emailverifycode';

export const POST: RequestHandler = async ({ locals }: RequestEvent) => {
	if (locals.user === null) {
		error(401, {
			message: 'You are not logged in'
		});
	}

	const condition = eq(timeOut.timerId, locals.user.id + TIMEOUT_DISCRIMINATOR);

	const timeout = await db.query.timeOut.findFirst({
		where: condition
	});
	if (timeout !== undefined) {
		if (isWithinExpirationDate(timeout.expires)) {
			error(400, `You cannot send another email for the next minute`);
		} else {
			await db.delete(timeOut).where(condition);
		}
	}
	if (locals.user.isEmailVerified) {
		error(400, 'You are already verified');
	}

	await newEmailVerificationCode(locals.user);

	await db
		.insert(timeOut)
		.values({
			timerId: locals.user.id + TIMEOUT_DISCRIMINATOR,
			expires: createDate(new TimeSpan(1, 'm'))
		})
		.onConflictDoNothing();

	return new Response(JSON.stringify(undefined), {
		status: 200
	});
};
