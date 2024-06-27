import { error } from '@sveltejs/kit';
import { newEmailVerificationCode } from '$lib/models/emailVerificationCode';
import type { RequestEvent, RequestHandler } from './$types';
import { db } from '$lib/models/db';
import { eq } from 'drizzle-orm';
import { timeOut, user } from '$lib/models/schema';
import { TimeSpan, createDate, isWithinExpirationDate } from 'oslo';
import { z } from 'zod';
import { fromZodError } from 'zod-validation-error';
import { loginPassword, email as zEmail } from '$lib/utils';
import { verifyPassword } from '$lib/models/user';

const TIMEOUT_DISCRIMINATOR = 'emailverifycode';

export const POST: RequestHandler = async ({ locals }: RequestEvent) => {
	if (locals.user === null) {
		error(401, {
			message: 'You are not logged in'
		});
	}
	if (locals.user.isEmailVerified) {
		error(400, 'You are already verified');
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

const putInputSchema = z.object({
	email: zEmail,
	password: loginPassword
});

export const PUT: RequestHandler = async ({ locals, request }) => {
	if (locals.user === null) {
		error(401, {
			message: 'You are not logged in'
		});
	}
	if (!locals.user.isEmailVerified) {
		error(401, {
			message: 'Your email must be verified'
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

	const zodResult = putInputSchema.safeParse(await request.json());
	if (!zodResult.success) {
		error(400, fromZodError(zodResult.error).toString());
	}
	const { email, password } = zodResult.data;

	const isPasswordValid = await verifyPassword(locals.user.id, password);
	if (typeof isPasswordValid === 'string') {
		error(400, 'Password is invalid');
	}

	if (email === locals.user.id) {
		error(400, 'The new email must not be the same as your current email.');
	}
	if (
		(await db.query.user.findFirst({
			where: eq(user.id, email)
		})) !== undefined
	) {
		error(400, 'This email is already in use');
	}

	await newEmailVerificationCode(locals.user, email);

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
