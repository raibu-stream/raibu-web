import { error } from '@sveltejs/kit';
import { passwordResetToken } from '$lib/models/db.js';
import { LuciaError } from 'lucia';
import { auth } from '$lib/models/db';

export const POST = async ({ request }) => {
	const formData = await request.json();
	const email = formData.email;

	try {
		const key = await auth.getKey('email', email);
		const user = await auth.getUser(key.userId);

		if (user.isEmailVerified) {
			await passwordResetToken.new(user);
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
