import { error, type RequestEvent } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { auth, db } from '$lib/models/db';
import { user } from '$lib/models/schema';
import { eq } from 'drizzle-orm';
import { newEmailVerificationCode } from '$lib/models/emailVerificationCode';
import { z } from 'zod';
import { fromZodError } from 'zod-validation-error';
import { email, loginPassword } from '$lib/utils';
import { createUser, deleteUser } from '$lib/models/user';

const postInputSchema = z.object({
	email: email,
	password: loginPassword,
	shouldSendVerificationEmail: z.boolean()
});

export const POST: RequestHandler = async ({ request, locals }: RequestEvent) => {
	if (locals.user === null || !locals.user?.isAdmin) {
		error(401, 'You are not an admin');
	}

	const zodResult = postInputSchema.safeParse(await request.json());
	if (!zodResult.success) {
		error(400, fromZodError(zodResult.error).toString());
	}
	const { email, password, shouldSendVerificationEmail } = zodResult.data;

	const user = await createUser(email, password);
	if (user === undefined) {
		error(400, {
			message: 'This email is already being used'
		});
	}

	if (shouldSendVerificationEmail) {
		await newEmailVerificationCode(user);
	}

	return new Response(JSON.stringify(undefined), {
		status: 200
	});
};

const patchInputSchema = z.object({
	userId: z.string().trim().min(1).max(255),
	update: z
		.object({
			isAdmin: z.boolean(),
			isEmailVerified: z.boolean(),
			isLocked: z.boolean(),
			id: z.string().trim().min(1).max(255)
		})
		.partial()
});

export const PATCH: RequestHandler = async ({ locals, request }) => {
	if (locals.user === null || !locals.user?.isAdmin) {
		error(401, 'You are not an admin');
	}

	const zodResult = patchInputSchema.safeParse(await request.json());
	if (!zodResult.success) {
		error(400, fromZodError(zodResult.error).toString());
	}
	const { userId, update } = zodResult.data;

	await db.update(user).set(update).where(eq(user.id, userId));
	await auth.invalidateUserSessions(userId);

	return new Response(JSON.stringify(undefined), {
		status: 200
	});
};

const deleteInputSchema = z.object({
	userId: z.string().trim().min(1).max(255)
});

export const DELETE: RequestHandler = async ({ locals, request }) => {
	if (locals.user === null || !locals.user?.isAdmin) {
		error(401, 'You are not an admin');
	}

	const zodResult = deleteInputSchema.safeParse(await request.json());
	if (!zodResult.success) {
		error(400, fromZodError(zodResult.error).toString());
	}
	const { userId } = zodResult.data;

	await deleteUser(userId);

	return new Response(JSON.stringify(undefined), {
		status: 200
	});
};
