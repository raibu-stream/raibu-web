import { auth, createSession, db } from '$lib/models/db';
import { verifyTooManyLoginsToken } from '$lib/models/tooManyLoginsToken';
import type { RequestEvent, RequestHandler } from './$types';
import * as schema from '$lib/models/schema';
import { eq } from 'drizzle-orm';

export const GET: RequestHandler = async ({ params }: RequestEvent) => {
	const token = params.token;
	const user = await verifyTooManyLoginsToken(token);

	await db.update(schema.user).set({ isLocked: false }).where(eq(schema.user.id, user.id));
	await auth.invalidateUserSessions(user.id);

	const sessionCookie = await createSession(user.id);

	return new Response(undefined, {
		status: 302,
		headers: {
			Location: '/user',
			'Set-Cookie': sessionCookie.serialize()
		}
	});
};
