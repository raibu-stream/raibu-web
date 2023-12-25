import { error } from '@sveltejs/kit';
import { verifyPasswordResetToken } from '$lib/models/passwordResetToken';
import { auth } from '$lib/models/db';
import commonPasswordList from 'fxa-common-password-list';
import type { RequestEvent, RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }: RequestEvent) => {
	const formData = await request.json();
	const newPassword = formData.newPassword;
	const token = formData.token;

	if (
		typeof newPassword !== 'string' ||
		newPassword.length < 8 ||
		newPassword.length > 255 ||
		commonPasswordList.test(newPassword)
	) {
		throw error(400, {
			message: 'New password is invalid'
		});
	}
	if (typeof token !== 'string') {
		throw error(400, {
			message: 'Token is invalid'
		});
	}

	try {
		const user = await verifyPasswordResetToken(token);
		await auth.invalidateAllUserSessions(user.userId);
		await auth.updateKeyPassword('email', user.email, newPassword);

		const session = await auth.createSession({
			userId: user.userId,
			attributes: {}
		});
		const sessionCookie = auth.createSessionCookie(session);

		return new Response(null, {
			status: 200,
			headers: {
				'Set-Cookie': sessionCookie.serialize()
			}
		});
	} catch (e) {
		console.error(e);
		throw error(400, {
			message: 'Invalid or expired password reset link'
		});
	}
};
