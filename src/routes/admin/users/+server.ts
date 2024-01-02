import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { auth, db } from '$lib/models/db';
import { LuciaError } from 'lucia';
import { emailVerificationCode, passwordResetToken, requestLog, tooManyLoginsToken } from '$lib/models/schema';
import { eq } from 'drizzle-orm';

export const PATCH: RequestHandler = async ({ locals, request }) => {
	let session = await locals.auth.validate();
	if (!session || !session.user.isAdmin) {
		throw error(401, 'You are not an admin');
	}

	const formData = await request.json();
	const rawUpdate = formData.update;
	const userId = formData.userId;

	if (!(typeof userId === 'string')) throw error(400, 'Provide a user ID')

	let update: Partial<Lucia.DatabaseUserAttributes> = {};
	if (typeof rawUpdate.is_admin === 'boolean') update.is_admin = rawUpdate.is_admin
	if (typeof rawUpdate.is_email_verified === 'boolean') update.is_email_verified = rawUpdate.is_email_verified
	if (typeof rawUpdate.is_locked === 'boolean') update.is_locked = rawUpdate.is_locked
	if (typeof rawUpdate.email === 'string') update.email = rawUpdate.email

	try {
		await auth.updateUserAttributes(userId, update)
	} catch (e) {
		if (e instanceof LuciaError && e.message === 'AUTH_INVALID_USER_ID') {
			throw error(400, 'User does not exist')
		}
		throw error(500, 'An unknown error occurred')
	};

	return new Response(JSON.stringify(undefined), {
		status: 200
	});
};

export const DELETE: RequestHandler = async ({ locals, request }) => {
	let session = await locals.auth.validate();
	if (!session || !session.user.isAdmin) {
		throw error(401, 'You are not an admin');
	}

	const formData = await request.json();
	const userId = formData.userId;
	if (typeof userId !== 'string') throw "Provide a user ID";

	try {
		await Promise.all([
			db.delete(tooManyLoginsToken).where(eq(tooManyLoginsToken.userId, userId)),
			db.delete(emailVerificationCode).where(eq(emailVerificationCode.userId, userId)),
			db.delete(passwordResetToken).where(eq(passwordResetToken.userId, userId)),
			db.delete(requestLog).where(eq(requestLog.userId, userId)),
		]);

		await auth.deleteUser(userId)
	} catch (e) {
		console.error(e);

		throw error(500, {
			message: 'An unknown error occurred'
		});
	}


	return new Response(JSON.stringify(undefined), {
		status: 200
	});
};
