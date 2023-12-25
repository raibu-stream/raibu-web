import { error } from '@sveltejs/kit';
import { newPasswordResetToken } from '$lib/models/passwordResetToken';
import { LuciaError } from 'lucia';
import { auth } from '$lib/models/db';
import type { RequestEvent, RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }: RequestEvent) => {
	const formData = await request.json();
	const email = formData.email;

	try {
		const key = await auth.getKey('email', email);
		const user = await auth.getUser(key.userId);

		if (user.isEmailVerified) {
			await newPasswordResetToken(user);
		}
	} catch (e) {
		if (e instanceof LuciaError && e.message === 'AUTH_INVALID_KEY_ID') {
			return new Response(JSON.stringify(undefined), {
				status: 200
			});
		}
		throw error(500, {
			message: 'An unknown error occurred'
		});
	}

	return new Response(JSON.stringify(undefined), {
		status: 200
	});
};
