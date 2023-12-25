import { auth } from '$lib/models/db';
import { LuciaError } from 'lucia';
import { error, type HttpError } from '@sveltejs/kit';
import ExpiryMap from 'expiry-map';
import { newTooManyLoginsToken } from '$lib/models/tooManyLoginsToken';
import type { RequestEvent, RequestHandler } from './$types';

const ONE_DAY_IN_MS = 1000 * 60 * 60 * 24;

const loginAttempts = new ExpiryMap(ONE_DAY_IN_MS);

export const POST: RequestHandler = async ({ request, locals }: RequestEvent) => {
	const formData = await request.json();
	let email = formData.email;
	const password = formData.password;

	if (typeof email !== 'string') {
		throw error(400, {
			message: 'Invalid email'
		});
	}
	if (typeof password !== 'string') {
		throw error(400, {
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
				throw error(400, {
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
		loginAttempts.delete(email);
	} catch (e) {
		if (
			e instanceof LuciaError &&
			(e.message === 'AUTH_INVALID_KEY_ID' || e.message === 'AUTH_INVALID_PASSWORD')
		) {
			if (e.message === 'AUTH_INVALID_KEY_ID') {
				throw error(400, {
					message: 'Incorrect email or password'
				});
			}

			await wrongPassword(email);
			throw error(400, {
				message: 'Incorrect email or password'
			});
		}
		if (isHttpError(e)) {
			throw e;
		}
		throw error(500, {
			message: 'An unknown error occurred'
		});
	}

	return new Response(undefined, {
		status: 200
	});
};

export const DELETE: RequestHandler = async ({ locals }: RequestEvent) => {
	const session = await locals.auth.validate();
	if (!session) throw error(401);

	await auth.invalidateSession(session.sessionId);
	locals.auth.setSession(null);

	return new Response(undefined, {
		status: 200
	});
};

const wrongPassword = async (email: string) => {
	const attempts = loginAttempts.get(email);
	const key = await auth.getKey('email', email);
	const user = await auth.getUser(key.userId);

	if (!user.isEmailVerified) {
		return;
	}

	if (attempts !== undefined && attempts >= 4) {
		await auth.updateUserAttributes(user.userId, {
			isLocked: true
		});
		await auth.invalidateAllUserSessions(user.userId);
		await newTooManyLoginsToken(user);
		loginAttempts.delete(email);

		throw error(400, {
			message:
				'Too many failed login attempts. Your account has been locked. Check your email to unlock it.'
		});
	}

	loginAttempts.delete(email);
	loginAttempts.set(email, attempts === undefined ? 1 : attempts + 1);
};

const isHttpError = (e: any): e is HttpError => {
	return 'code' in e && 'body' in e && 'message' in e.body;
};
