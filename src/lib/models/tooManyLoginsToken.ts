import { generateId } from 'lucia';
import { TimeSpan, createDate, isWithinExpirationDate } from 'oslo';
import TooManyLoginsEmail from '$lib/email/TooManyLoginsEmail.svelte';
import { renderMjmlComponent } from '$lib/email/email';
import { PUBLIC_RAIBU_URL } from '$env/static/public';
import { sendEmail } from '$lib/email/email';
import { error } from '@sveltejs/kit';
import { db } from './db';
import type { User } from 'lucia';
import { tooManyLoginsToken } from './schema';
import { eq, type InferSelectModel } from 'drizzle-orm';

export type PasswordResetToken = InferSelectModel<typeof tooManyLoginsToken>;

const ONE_HOUR_IN_MS = 1000 * 60 * 60;

/**
 * Finds a {@linkcode tooManyLoginsToken} associated with the user,
 * and returns if one exists and it won't be expired after 1 hour from now.
 * Otherwise, create a new token and email it to the user.
 *
 * @returns The found or newly created token.
 */
export const newTooManyLoginsToken = async (email: string): Promise<PasswordResetToken> => {
	const tokens = await db.query.tooManyLoginsToken.findMany({
		where: eq(tooManyLoginsToken.user, email)
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
			.insert(tooManyLoginsToken)
			.values({
				token: randomString,
				user: email,
				expires: createDate(new TimeSpan(4, 'h'))
			})
			.returning()
	)[0];

	const emailHtml = renderMjmlComponent(TooManyLoginsEmail, {
		unlockLink: `${PUBLIC_RAIBU_URL}/user/too-many-logins/${token.token}`
	});
	await sendEmail(emailHtml, 'Unlock your account', email);

	return token;
};

/**
 * Checks if a {@linkcode tooManyLoginsToken} matching verifyMe exists that isn't expired,
 * then deletes it. Errors if there is no valid token.
 *
 * @returns The user associated with the now deleted token.
 */
export const verifyTooManyLoginsToken = async (verifyMe: string): Promise<User> => {
	const condition = eq(tooManyLoginsToken.token, verifyMe);

	return db.transaction(async (tx) => {
		const token = await tx.query.tooManyLoginsToken.findFirst({
			where: condition,
			with: { user: true }
		});
		if (token === undefined) {
			error(400, 'Invalid or expired token');
		}

		await tx.delete(tooManyLoginsToken).where(condition);

		if (!isWithinExpirationDate(token.expires)) {
			error(400, 'Expired token');
		}

		return token.user;
	});
};
