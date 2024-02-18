import { error, type RequestEvent } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { auth, createUser, db } from '$lib/models/db';
import {
	emailVerificationCode,
	passwordResetToken,
	requestLog,
	tooManyLoginsToken,
	user
} from '$lib/models/schema';
import { eq } from 'drizzle-orm';
import type { User } from 'lucia';
import { newEmailVerificationCode } from '$lib/models/emailVerificationCode';


export const POST: RequestHandler = async ({ request, locals }: RequestEvent) => {
	if (locals.user === null || !locals.user?.isAdmin) {
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

	const user = await createUser(email, password);
	if (user === undefined) {
		error(400, {
			message: 'This email is already being used'
		});
	}

	await newEmailVerificationCode(user);

	return new Response(JSON.stringify(undefined), {
		status: 200
	});
};

export const PATCH: RequestHandler = async ({ locals, request }) => {
	if (locals.user === null || !locals.user?.isAdmin) {
		error(401, 'You are not an admin');
	}

	const formData = await request.json();
	const rawUpdate = formData.update;
	const userId = formData.userId;

	if (!(typeof userId === 'string')) error(400, 'Provide a user ID');

	const update: Partial<User> = {};
	if (typeof rawUpdate.isAdmin === 'boolean') update.isAdmin = rawUpdate.isAdmin;
	if (typeof rawUpdate.isEmailVerified === 'boolean')
		update.isEmailVerified = rawUpdate.isEmailVerified;
	if (typeof rawUpdate.isLocked === 'boolean') update.isLocked = rawUpdate.isLocked;
	if (typeof rawUpdate.id === 'string') update.id = rawUpdate.id;

	await db.update(user).set(update).where(eq(user.id, userId));
	await auth.invalidateUserSessions(userId);

	return new Response(JSON.stringify(undefined), {
		status: 200
	});
};

export const DELETE: RequestHandler = async ({ locals, request }) => {
	if (locals.user === null || !locals.user?.isAdmin) {
		error(401, 'You are not an admin');
	}

	const formData = await request.json();
	const userId = formData.userId;
	if (typeof userId !== 'string') throw 'Provide a user ID';

	await db.delete(user).where(eq(user.id, userId));

	return new Response(JSON.stringify(undefined), {
		status: 200
	});
};
