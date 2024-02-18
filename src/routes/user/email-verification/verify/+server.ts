import { error } from '@sveltejs/kit';
import { auth, createSession, db } from '$lib/models/db';
import { verifyEmailVerificationCode } from '$lib/models/emailVerificationCode';
import type { RequestEvent, RequestHandler } from './$types';
import { timeOut, user } from '$lib/models/schema';
import { eq } from 'drizzle-orm';
import { EMAIL_VERIFICATION_VERIFY_TIMEOUT_DISCRIMINATOR } from '$lib/utils';
import { isWithinExpirationDate } from 'oslo';
import { z } from 'zod';
import { fromZodError } from 'zod-validation-error';

const postInputSchema = z.object({
	code: z.string().min(0),
})

export const POST: RequestHandler = async ({ request, locals }: RequestEvent) => {
	if (locals.user === null) {
		error(401);
	}

	const timeout = await db.query.timeOut.findFirst({
		where: eq(timeOut.timerId, locals.user.id + EMAIL_VERIFICATION_VERIFY_TIMEOUT_DISCRIMINATOR)
	});
	if (timeout !== undefined && isWithinExpirationDate(timeout.expires) && timeout.attempts! >= 7) {
		error(400, { message: `You cannot attempt to verify your account for the next minute` });
	}

	const zodResult = postInputSchema.safeParse(await request.json());
	if (!zodResult.success) {
		error(400, fromZodError(zodResult.error).toString())
	}
	const { code } = zodResult.data;

	await verifyEmailVerificationCode(code, locals.user);

	await db.update(user).set({ isEmailVerified: true }).where(eq(user.id, locals.user.id));
	await auth.invalidateUserSessions(locals.user.id);

	const sessionCookie = await createSession(locals.user.id);

	return new Response(undefined, {
		status: 200,
		headers: {
			'Set-Cookie': sessionCookie.serialize()
		}
	});
};
