import { auth } from '$lib/auth';
import { LuciaError } from 'lucia';
import { error } from '@sveltejs/kit';

export const POST = async ({ request, locals }) => {
	const formData = await request.json();
	const email = formData.email;
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

	try {
		const key = await auth.useKey('email', email.toLowerCase().trim(), password);
		const session = await auth.createSession({
			userId: key.userId,
			attributes: {}
		});
		locals.auth.setSession(session);
	} catch (e) {
		if (
			e instanceof LuciaError &&
			(e.message === 'AUTH_INVALID_KEY_ID' || e.message === 'AUTH_INVALID_PASSWORD')
		) {
			throw error(400, {
				message: 'Incorrect email or password'
			});
		}
		throw error(500, {
			message: "An unknown error occurred"
		});
	}

	return new Response(undefined, {
		status: 200
	});
};

export const DELETE = async ({ locals }) => {
	const session = await locals.auth.validate();
	if (!session) throw error(401);

	await auth.invalidateSession(session.sessionId);
	locals.auth.setSession(null);

	return new Response(undefined, {
		status: 200
	});
}