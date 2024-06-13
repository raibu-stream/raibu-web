import { error } from '@sveltejs/kit';
import { db } from '$lib/models/db';
import { newEmailVerificationCode } from '$lib/models/emailVerificationCode';
import { disableSignupId, email, password } from '$lib/utils.js';
import type { RequestEvent, RequestHandler } from './$types';
import { z } from 'zod';
import { fromZodError } from 'zod-validation-error';
import { siteConfig } from '$lib/models/schema';
import { eq } from 'drizzle-orm';
import { createSession, createUser, deleteUser } from '$lib/models/user';

const postInputSchema = z.object({
	email,
	password
});

export const POST: RequestHandler = async ({ request }: RequestEvent) => {
	const signupDisabledMessage =
		(await db.query.siteConfig.findFirst({ where: eq(siteConfig.id, disableSignupId) }))?.value ??
		undefined;
	if (signupDisabledMessage !== undefined) {
		error(400, signupDisabledMessage);
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

export const DELETE: RequestHandler = async ({ locals }) => {
	if (locals.user === null) {
		error(401, {
			message: 'You are not logged in'
		});
	}

	await deleteUser(locals.user.id);

	return new Response(JSON.stringify(undefined), {
		status: 200,
	});
};
