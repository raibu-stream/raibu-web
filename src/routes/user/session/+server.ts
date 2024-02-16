import { auth, db } from '$lib/models/db';
import { LuciaError } from 'lucia';
import { error, type HttpError } from '@sveltejs/kit';
import { newTooManyLoginsToken } from '$lib/models/tooManyLoginsToken';
import type { RequestEvent, RequestHandler } from './$types';
import { timeOut } from '$lib/models/schema';
import { and, eq, gt, sql } from 'drizzle-orm';

const ONE_MINUTE_IN_MS = 1000 * 60;

export const POST: RequestHandler = async ({ request, locals, getClientAddress }: RequestEvent) => {
	const formData = await request.json();
	let email = formData.email;
	const password = formData.password;

	const timeout = await db.query.timeOut.findFirst({
		where: and(eq(timeOut.timerId, getClientAddress() + 'session'), gt(timeOut.attempts, 10))
	});
	if (timeout !== undefined) {
		error(400, "You've tried logging in too many times. Try again in 1 minute.");
	}

	if (typeof email !== 'string') {
		error(400, {
			message: 'Invalid email'
		});
	}
	if (typeof password !== 'string') {
		error(400, {
			message: 'Invalid password'
		});
	}

	email = email.toLowerCase().trim();

	try {
		{
			const key = await auth.getKey('email', email);
			const user = await auth.getUser(key.userId);

			if (user.isLocked) {
				newTooManyLoginsToken(user);
				error(400, {
					message:
						'Too many failed login attempts. Your account has been locked. Check your email to unlock it.'
				});
			}
		}

		const key = await auth.useKey('email', email, password);
		const session = await auth.createSession({
			userId: key.userId,
			attributes: {}
		});
		locals.auth.setSession(session);
		await db.delete(timeOut).where(eq(timeOut.timerId, email + 'session'));
	} catch (e) {
		if (
			e instanceof LuciaError &&
			(e.message === 'AUTH_INVALID_KEY_ID' || e.message === 'AUTH_INVALID_PASSWORD')
		) {
			const timeout = await db.query.timeOut.findFirst({
				where: eq(timeOut.timerId, getClientAddress() + 'session')
			});
			if (timeout !== undefined) {
				await db
					.update(timeOut)
					.set({ attempts: sql`${timeOut.attempts} + 1` })
					.where(eq(timeOut.timerId, getClientAddress() + 'session'));
			} else {
				await db.insert(timeOut).values({
					timerId: getClientAddress() + 'session',
					expires: new Date().getTime() + ONE_MINUTE_IN_MS,
					attempts: 1
				});
			}

			if (e.message === 'AUTH_INVALID_KEY_ID') {
				error(400, {
					message: 'Incorrect email or password'
				});
			}

			await wrongPassword(email);
			error(400, {
				message: 'Incorrect email or password'
			});
		}

		error(500, {
			message: 'An unknown error occurred'
		});
	}

	return new Response(undefined, {
		status: 200
	});
};

export const DELETE: RequestHandler = async ({ locals }: RequestEvent) => {
	const session = await locals.auth.validate();
	if (!session) error(401);

	await auth.invalidateSession(session.sessionId);
	locals.auth.setSession(null);

	return new Response(undefined, {
		status: 200
	});
};

const wrongPassword = async (email: string) => {
	const key = await auth.getKey('email', email);
	const user = await auth.getUser(key.userId);
	if (!user.isEmailVerified) {
		return;
	}

	const attempts = (
		await db.query.timeOut.findFirst({
			where: eq(timeOut.timerId, email + 'session')
		})
	)?.attempts;

	if (attempts !== undefined && attempts !== null && attempts >= 4) {
		await auth.updateUserAttributes(user.userId, {
			is_locked: true
		});
		await auth.invalidateAllUserSessions(user.userId);
		await newTooManyLoginsToken(user);
		await db.delete(timeOut).where(eq(timeOut.timerId, email + 'session'));

		error(400, {
			message:
				'Too many failed login attempts. Your account has been locked. Check your email to unlock it.'
		});
	} else if (attempts === undefined) {
		await db.insert(timeOut).values({
			timerId: email + 'session',
			expires: new Date().getTime() + ONE_MINUTE_IN_MS,
			attempts: 1
		});
	} else {
		await db
			.update(timeOut)
			.set({ attempts: sql`${timeOut.attempts} + 1` })
			.where(eq(timeOut.timerId, email + 'session'));
	}
};