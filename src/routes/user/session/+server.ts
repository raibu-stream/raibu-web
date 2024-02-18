import { auth, createSession, db, signInUser } from '$lib/models/db';
import { error } from '@sveltejs/kit';
import { newTooManyLoginsToken } from '$lib/models/tooManyLoginsToken';
import type { RequestEvent, RequestHandler } from './$types';
import { timeOut } from '$lib/models/schema';
import { and, eq, gt, sql } from 'drizzle-orm';
import * as schema from '$lib/models/schema';
import { TimeSpan, createDate, isWithinExpirationDate } from "oslo";
import { arbitraryHandleError } from '../../../hooks.server';
import { incrementOrCreateTimeout } from '$lib/models/timeout';
import { z } from 'zod';
import { fromZodError } from 'zod-validation-error';
import { loginEmail, loginPassword } from '$lib/utils';

const postInputSchema = z.object({
	email: loginEmail,
	password: loginPassword
})

export const POST: RequestHandler = async ({ request, locals, getClientAddress }: RequestEvent) => {
	const timeout = await db.query.timeOut.findFirst({
		where: and(eq(timeOut.timerId, getClientAddress() + 'session'), gt(timeOut.attempts, 10))
	});

	if (timeout !== undefined && isWithinExpirationDate(timeout.expires)) {
		error(400, "You've tried logging in too many times. Try again in 1 minute.");
	}

	const zodResult = postInputSchema.safeParse(await request.json());
	if (!zodResult.success) {
		error(400, fromZodError(zodResult.error).toString())
	}
	const { email, password } = zodResult.data;

	const sessionCookie = await signInUser(email, password);
	if (sessionCookie === 'Password is invalid' || sessionCookie === 'User does not exist') {
		if (sessionCookie === 'Password is invalid') await wrongPassword(email);
		if (sessionCookie === 'User does not exist') await incrementOrCreateTimeout(getClientAddress() + 'session')

		error(400, {
			message: 'Incorrect email or password'
		});
	}

	if (sessionCookie === 'User is locked') {
		newTooManyLoginsToken(email);
		error(400, {
			message:
				'Too many failed login attempts. Your account has been locked. Check your email to unlock it.'
		});
	}

	await db.delete(timeOut).where(eq(timeOut.timerId, email + 'session'));

	if (locals.session !== null) {
		auth.invalidateSession(locals.session.id)
	}

	return new Response(undefined, {
		status: 200,
		headers: {
			'Set-Cookie': sessionCookie.serialize()
		}
	});
};

export const DELETE: RequestHandler = async ({ locals }: RequestEvent) => {
	if (locals.user === null) error(401);

	await auth.invalidateSession(locals.session!.id);

	return new Response(undefined, {
		status: 200
	});
};

const wrongPassword = async (email: string) => {
	const user = (await db.query.user.findFirst({
		where: eq(schema.user.id, email)
	}))!;
	if (!user.isEmailVerified) {
		return;
	}

	const timeout = (await incrementOrCreateTimeout(email + 'session'));

	if (timeout.attempts! >= 4 && isWithinExpirationDate(timeout.expires)) {
		await db.update(schema.user).set({ isLocked: true }).where(eq(schema.user.id, email));

		await auth.invalidateUserSessions(email);
		newTooManyLoginsToken(email).catch((err) => arbitraryHandleError(err));
		await db.delete(timeOut).where(eq(timeOut.timerId, email + 'session'));

		error(400, {
			message:
				'Too many failed login attempts. Your account has been locked. Check your email to unlock it.'
		});
	}
};