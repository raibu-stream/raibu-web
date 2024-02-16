import { error } from '@sveltejs/kit';
import { auth } from '$lib/models/db';
import { LuciaError } from 'lucia';
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

		const session = await auth.createSession({
			userId: user.userId,
			attributes: {}
		});
		locals.auth.setSession(session);

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
