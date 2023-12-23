import { error } from '@sveltejs/kit';
import { EmailVerificationCode } from '$lib/models/db';
import ExpiryMap from 'expiry-map';
import type { RequestEvent, RequestHandler } from './$types';

const ONE_MINUTE_IN_MS = 1000 * 60;

const timeouts = new ExpiryMap(ONE_MINUTE_IN_MS);

export const POST: RequestHandler = async ({ locals }: RequestEvent) => {
	const session = await locals.auth.validate();

	if (!session) {
		throw error(401, {
			message: 'You are not logged in'
		});
	}
	const timeout = timeouts.get(session.user.userId);
	if (timeout === null) {
		throw error(400, { message: `You cannot send another email for the next minute` });
	}
	if (session.user.isEmailVerified) {
		throw error(400, { message: 'You are already verified' });
	}

	try {
		EmailVerificationCode.new(session.user);
	} catch (e) {
		throw error(500, {
			message: 'An unknown error occurred'
		});
	}

	timeouts.set(session.user.userId, null);

	return new Response(JSON.stringify(undefined), {
		status: 200
	});
};
