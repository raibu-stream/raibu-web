import { error } from '@sveltejs/kit';
import { createSession, createUser } from '$lib/models/db';
import { dev } from '$app/environment';
import { newEmailVerificationCode } from '$lib/models/emailVerificationCode';
import { email, password } from '$lib/utils.js';
import type { RequestEvent, RequestHandler } from './$types';
import { z } from 'zod';
import { fromZodError } from 'zod-validation-error';

const postInputSchema = z.object({
	email,
	password
});

export const POST: RequestHandler = async ({ request }: RequestEvent) => {
	if (!dev) {
		error(400, 'We are currently not accepting registrations. Come back later');
	}

	const zodResult = postInputSchema.safeParse(await request.json());
	if (!zodResult.success) {
		error(400, fromZodError(zodResult.error).toString());
	}
	const { email, password } = zodResult.data;

	const user = await createUser(email, password);
	if (user === undefined) {
		error(400, 'This email is already being used');
	}
	await newEmailVerificationCode(user);

	const sessionCookie = await createSession(email);

	return new Response(JSON.stringify(undefined), {
		status: 200,
		headers: {
			Location: '/',
			'Set-Cookie': sessionCookie.serialize()
		}
	});
};
