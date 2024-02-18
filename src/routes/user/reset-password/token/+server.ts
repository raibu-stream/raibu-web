import { error } from '@sveltejs/kit';
import { newPasswordResetToken } from '$lib/models/passwordResetToken';
import { auth, db } from '$lib/models/db';
import type { RequestEvent, RequestHandler } from './$types';
import { eq } from 'drizzle-orm';
import * as schema from '$lib/models/schema';
import { arbitraryHandleError, handleError } from '../../../../hooks.server';

export const POST: RequestHandler = async ({ request }: RequestEvent) => {
	const formData = await request.json();
	const email = formData.email;

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
