import { generateId } from 'lucia';
import { TimeSpan, createDate, isWithinExpirationDate } from 'oslo';
import ResetPasswordEmail from '$lib/email/ResetPasswordEmail.svelte';
import { renderMjmlComponent } from '$lib/email/email';
import { PUBLIC_RAIBU_URL } from '$env/static/public';
import { sendEmail } from '$lib/email/email';
import { error } from '@sveltejs/kit';
import { db } from './db';
import type { User } from 'lucia';
import { passwordResetToken } from './schema';
import { eq, type InferSelectModel } from 'drizzle-orm';

const ONE_HOUR_IN_MS = 1000 * 60 * 60;

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
		where: eq(passwordResetToken.user, user.id)
	});

	if (tokens.length > 0) {
		const existingToken = tokens.find((token) => {
			return isWithinExpirationDate(new Date(token.expires.getTime() - ONE_HOUR_IN_MS));
		});
		if (existingToken !== undefined) {
			return existingToken;
		}
	}

	const randomString = generateId(63);
	const token = (
		await db
			.insert(passwordResetToken)
			.values({
				token: randomString,
				user: user.id,
				expires: createDate(new TimeSpan(4, 'h'))
			})
			.returning()
	)[0];

	const emailHtml = renderMjmlComponent(ResetPasswordEmail, {
		resetLink: `${PUBLIC_RAIBU_URL}/?password-reset=${token.token}`
	});
	await sendEmail(emailHtml, 'Reset your password', user.id);

	return token;
};

/**
 * Checks if a {@linkcode passwordResetToken} matching verifyMe exists that isn't expired,
 * then deletes it. Errors if there is no valid token.
 *
 * @returns The user associated with the now deleted token.
 */
export const verifyPasswordResetToken = async (verifyMe: string): Promise<User> => {
	const condition = eq(passwordResetToken.token, verifyMe);

	return db.transaction(async (tx) => {
		const token = await tx.query.passwordResetToken.findFirst({
			where: condition,
			with: { user: true }
		});
		if (token === undefined) {
			error(400, 'Invalid or expired password reset link');
		}

		await tx.delete(passwordResetToken).where(condition);

		if (!isWithinExpirationDate(token.expires)) {
			error(400, 'Expired password reset link');
		}

		return token.user;
	});
};
