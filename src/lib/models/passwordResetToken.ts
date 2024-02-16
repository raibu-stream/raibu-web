import { generateRandomString, isWithinExpiration } from 'lucia/utils';
import ResetPasswordEmail from '$lib/email/ResetPasswordEmail.svelte';
import { renderMjmlComponent } from '$lib/email/email';
import { PUBLIC_RAIBU_URL } from '$env/static/public';
import { sendEmail } from '$lib/email/email';
import { error } from '@sveltejs/kit';
import { auth, db } from './db';
import type { User } from 'lucia';
import { passwordResetToken } from './schema';
import { eq, type InferSelectModel } from 'drizzle-orm';

const ONE_HOUR_IN_MS = 1000 * 60 * 60;
const FOUR_HOURS_IN_MS = ONE_HOUR_IN_MS * 4;

export type PasswordResetToken = InferSelectModel<typeof passwordResetToken>;

/**
 * Finds a {@linkcode passwordResetToken} associated with the user,
 * and returns if one exists and it won't be expired after 1 hour from now.
 * Otherwise, create a new token and email it to the user.
 *
 * @returns The found or newly created token.
 */
export const newPasswordResetToken = async (user: User): Promise<PasswordResetToken> => {
	const tokens = await db.query.passwordResetToken.findMany({
		where: eq(passwordResetToken.userId, user.userId)
	});

	if (tokens.length > 0) {
		const existingToken = tokens.find((token) => {
			return isWithinExpiration(token.expires - ONE_HOUR_IN_MS);
		});
		if (existingToken !== undefined) {
			return existingToken;
		}
	}

	const randomString = generateRandomString(63);
	const token = (
		await db
			.insert(passwordResetToken)
			.values({
				token: randomString,
				userId: user.userId,
				expires: new Date().getTime() + FOUR_HOURS_IN_MS
			})
			.returning()
	)[0];

	const emailHtml = renderMjmlComponent(ResetPasswordEmail, {
		resetLink: `${PUBLIC_RAIBU_URL}/?password-reset=${token.token}`
	});
	sendEmail(emailHtml, 'Reset your password', user.email);

	return token;
};

/**
 * Checks if a {@linkcode passwordResetToken} matching verifyMe exists that isn't expired,
 * then deletes it. Throws if there is no valid token.
 *
 * @returns The user associated with the now deleted token.
 */
export const verifyPasswordResetToken = async (verifyMe: string): Promise<User> => {
	const condition = eq(passwordResetToken.token, verifyMe);

	const token = await db.query.passwordResetToken.findFirst({ where: condition });
	if (token === undefined) {
		error(400, 'Invalid or expired password reset link');
	}

	await db.delete(passwordResetToken).where(condition);

	if (!isWithinExpiration(token.expires)) {
		error(400, 'Expired password reset link');
	}

	return await auth.getUser(token.userId);
};
