import { error } from '@sveltejs/kit';
import { auth, createSession, createUser } from '$lib/models/db';
import { dev } from '$app/environment';
import { newEmailVerificationCode } from '$lib/models/emailVerificationCode';
import { checkPasswordLength, emailRegex } from '$lib/utils.js';
import commonPasswordList from 'fxa-common-password-list';
import type { RequestEvent, RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, locals }: RequestEvent) => {
	if (!dev) {
		error(400, 'We are currently not accepting registrations. Come back later');
	}

	const formData = await request.json();
	const email = formData.email;
	const password = formData.password;

	if (typeof email !== 'string' || email === '' || !emailRegex.test(email) || email.length > 255) {
		error(400, {
			message: 'Invalid email'
		});
	}
	if (
		typeof password !== 'string' ||
		checkPasswordLength(password) !== undefined ||
		commonPasswordList.test(password)
	) {
		error(400, {
			message: 'Invalid password'
		});
	}

	let user = await createUser(email, password);
	if (user === undefined) {
		error(400, {
			message: 'This email is already being used'
		});
	}
	await newEmailVerificationCode(user);

	let sessionCookie = await createSession(email);

	return new Response(JSON.stringify(undefined), {
		status: 200,
		headers: {
			Location: "/",
			"Set-Cookie": sessionCookie.serialize()
		}

	});
};
