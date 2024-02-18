import { error } from '@sveltejs/kit';
import { newPasswordResetToken } from '$lib/models/passwordResetToken';
import { auth, db } from '$lib/models/db';
import type { RequestEvent, RequestHandler } from './$types';
import { eq } from 'drizzle-orm';
import * as schema from '$lib/models/schema';
import { arbitraryHandleError, handleError } from '../../../../hooks.server';
import { z } from 'zod';
import { fromZodError } from 'zod-validation-error';

const postInputSchema = z.object({
	email: z.string().trim().toLowerCase().min(1),
})

export const POST: RequestHandler = async ({ request }: RequestEvent) => {
	const zodResult = postInputSchema.safeParse(await request.json());
	if (!zodResult.success) {
		error(400, fromZodError(zodResult.error).toString())
	}
	const { email } = zodResult.data;

	const user = await db.query.user.findFirst({
		where: eq(schema.user.id, email)
	});
	if (user !== undefined && user.isEmailVerified) {
		newPasswordResetToken(user).catch((err) => arbitraryHandleError(err));
	}

	return new Response(JSON.stringify(undefined), {
		status: 200
	});
};
