import { error } from '@sveltejs/kit';
import { verifyPasswordResetToken } from '$lib/models/passwordResetToken';
import { auth, createSession, updateUserPassword } from '$lib/models/db';
import commonPasswordList from 'fxa-common-password-list';
import type { RequestEvent, RequestHandler } from './$types';
import { checkPasswordLength } from '$lib/utils';

export const POST: RequestHandler = async ({ request }: RequestEvent) => {
	const formData = await request.json();
	const newPassword = formData.newPassword;
	const token = formData.token;

	if (
		typeof newPassword !== 'string' ||
		checkPasswordLength(newPassword) ||
		commonPasswordList.test(newPassword)
	) {
		error(400, {
			message: 'New password is invalid'
		});
	}
	if (typeof token !== 'string') {
		error(400, {
			message: 'Token is invalid'
		});
	}

	let user = await verifyPasswordResetToken(token);
	await updateUserPassword(user.id, newPassword);
	const sessionCookie = await createSession(user.id);

	return new Response(null, {
		status: 200,
		headers: {
			'Set-Cookie': sessionCookie.serialize()
		}
	});
};
