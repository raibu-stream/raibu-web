import { error } from '@sveltejs/kit';
import { verifyPasswordResetToken } from '$lib/models/passwordResetToken';
import { createSession, updateUserPassword } from '$lib/models/db';
import type { RequestEvent, RequestHandler } from './$types';
import { z } from 'zod';
import { password } from '$lib/utils';
import { fromZodError } from 'zod-validation-error';

const postInputSchema = z.object({
	newPassword: password,
	token: z.string().min(1)
});

export const POST: RequestHandler = async ({ request }: RequestEvent) => {
	const zodResult = postInputSchema.safeParse(await request.json());
	if (!zodResult.success) {
		error(400, fromZodError(zodResult.error).toString());
	}
	const { token, newPassword } = zodResult.data;

	const user = await verifyPasswordResetToken(token);
	await updateUserPassword(user.id, newPassword);
	const sessionCookie = await createSession(user.id);

	return new Response(null, {
		status: 200,
		headers: {
			'Set-Cookie': sessionCookie.serialize()
		}
	});
};
