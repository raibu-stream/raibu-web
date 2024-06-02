import { error } from '@sveltejs/kit';
import { verifyPasswordResetToken } from '$lib/models/passwordResetToken';
import { createSession, updateUserPassword, verifyPassword } from '$lib/models/db';
import type { RequestEvent, RequestHandler } from './$types';
import { z } from 'zod';
import { loginPassword, password } from '$lib/utils';
import { fromZodError } from 'zod-validation-error';
import { sendPasswordResetAlert } from '$lib/email/email';
import { arbitraryHandleError } from '../../../../hooks.server';

const postInputSchema = z.object({
	newPassword: password,
	token: z.string().min(1).optional(),
	oldPassword: loginPassword.optional()
});

export const POST: RequestHandler = async ({ request, locals, getClientAddress }: RequestEvent) => {
	const zodResult = postInputSchema.safeParse(await request.json());
	if (!zodResult.success) {
		error(400, fromZodError(zodResult.error).toString());
	}
	const { token, newPassword, oldPassword } = zodResult.data;

	let user;
	if (token !== undefined) {
		user = await verifyPasswordResetToken(token);
	} else if (locals.user !== null && oldPassword !== undefined) {
		const isPasswordValid = await verifyPassword(locals.user.id, oldPassword);
		if (typeof isPasswordValid === 'string') {
			error(400, 'Old password is invalid');
		}

		user = isPasswordValid;
	} else {
		error(401, 'You must either provide a password reset token, or your password');
	}

	await updateUserPassword(user.id, newPassword);
	sendPasswordResetAlert(user.id, getClientAddress()).catch(arbitraryHandleError);
	const sessionCookie = await createSession(user.id);

	return new Response(null, {
		status: 200,
		headers: {
			'Set-Cookie': sessionCookie.serialize()
		}
	});
};
