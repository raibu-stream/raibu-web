import { error, type RequestEvent } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { auth, db } from '$lib/models/db';
import { LuciaError } from 'lucia';
import {
	emailVerificationCode,
	passwordResetToken,
	requestLog,
	tooManyLoginsToken
} from '$lib/models/schema';
import { eq } from 'drizzle-orm';
import { newEmailVerificationCode } from '$lib/models/emailVerificationCode';

export const POST: RequestHandler = async ({ request, locals }: RequestEvent) => {
	const session = await locals.auth.validate();
	if (!session || !session.user.isAdmin) {
		error(401, 'You are not an admin');
	}

	const formData = await request.json();
	const email = formData.email;
	const password = formData.password;

	if (typeof email !== 'string' || email === '') {
		error(400, {
			message: 'Invalid email'
		});
	}
	if (typeof password !== 'string' || password === '') {
		error(400, {
			message: 'Invalid password'
		});
	}

	try {
		const user = await auth.createUser({
			key: {
				providerId: 'email',
				providerUserId: email.toLowerCase(),
				password
			},
			attributes: {
				email,
				is_email_verified: false,
				is_locked: false,
				is_admin: false
			}
		});

		await newEmailVerificationCode(user);
	} catch (e) {
		if (e instanceof LuciaError && e.message === 'AUTH_DUPLICATE_KEY_ID') {
			error(400, {
				message: 'This email is already being used'
			});
		}
		error(500, {
			message: 'An unknown error occurred'
		});
	}

	return new Response(JSON.stringify(undefined), {
		status: 200
	});
};

export const PATCH: RequestHandler = async ({ locals, request }) => {
	const session = await locals.auth.validate();
	if (!session || !session.user.isAdmin) {
		error(401, 'You are not an admin');
	}

	const formData = await request.json();
	const rawUpdate = formData.update;
	const userId = formData.userId;

	if (!(typeof userId === 'string')) error(400, 'Provide a user ID');

	const update: Partial<Lucia.DatabaseUserAttributes> = {};
	if (typeof rawUpdate.is_admin === 'boolean') update.is_admin = rawUpdate.is_admin;
	if (typeof rawUpdate.is_email_verified === 'boolean')
		update.is_email_verified = rawUpdate.is_email_verified;
	if (typeof rawUpdate.is_locked === 'boolean') update.is_locked = rawUpdate.is_locked;
	if (typeof rawUpdate.email === 'string') update.email = rawUpdate.email;

	try {
		await auth.updateUserAttributes(userId, update);
	} catch (e) {
		if (e instanceof LuciaError && e.message === 'AUTH_INVALID_USER_ID') {
			error(400, 'User does not exist');
		}
		error(500, 'An unknown error occurred');
	}

	return new Response(JSON.stringify(undefined), {
		status: 200
	});
};

export const DELETE: RequestHandler = async ({ locals, request }) => {
	const session = await locals.auth.validate();
	if (!session || !session.user.isAdmin) {
		error(401, 'You are not an admin');
	}

	const formData = await request.json();
	const userId = formData.userId;
	if (typeof userId !== 'string') throw 'Provide a user ID';

	await Promise.all([
		db.delete(tooManyLoginsToken).where(eq(tooManyLoginsToken.userId, userId)),
		db.delete(emailVerificationCode).where(eq(emailVerificationCode.userId, userId)),
		db.delete(passwordResetToken).where(eq(passwordResetToken.userId, userId)),
		db.delete(requestLog).where(eq(requestLog.userId, userId))
	]);

	await auth.deleteUser(userId);


	return new Response(JSON.stringify(undefined), {
		status: 200
	});
};
