import { generateRandomString, isWithinExpiration } from 'lucia/utils';
import TooManyLoginsEmail from '$lib/email/TooManyLoginsEmail.svelte';
import { renderMjmlComponent } from '$lib/email/email';
import { PUBLIC_RAIBU_URL } from '$env/static/public';
import { sendEmail } from '$lib/email/email';
import { error } from '@sveltejs/kit';
import { auth, db } from './db';
import type { User } from 'lucia';
import { tooManyLoginsToken } from './schema';
import { eq, type InferSelectModel } from 'drizzle-orm';

export type PasswordResetToken = InferSelectModel<typeof tooManyLoginsToken>;

const ONE_HOUR_IN_MS = 1000 * 60 * 60;
const FOUR_HOURS_IN_MS = ONE_HOUR_IN_MS * 4;

/**
 * Finds a {@linkcode tooManyLoginsToken} associated with the user,
 * and returns if one exists and it won't be expired after 1 hour from now.
 * Otherwise, create a new token and email it to the user.
 *
 * @returns The found or newly created token.
 */
export const newTooManyLoginsToken = async (user: User): Promise<PasswordResetToken> => {
	const tokens = await db.query.tooManyLoginsToken.findMany({
		where: eq(tooManyLoginsToken.userId, user.userId)
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
			.insert(tooManyLoginsToken)
			.values({
				token: randomString,
				userId: user.userId,
				expires: new Date().getTime() + FOUR_HOURS_IN_MS
			})
			.returning()
	)[0];

	const emailHtml = renderMjmlComponent(TooManyLoginsEmail, {
		unlockLink: `${PUBLIC_RAIBU_URL}/user/too-many-logins/${token.token}`
	});
	sendEmail(emailHtml, 'Unlock your account', user.email);

	return token;
};

/**
 * Checks if a {@linkcode tooManyLoginsToken} matching verifyMe exists that isn't expired,
 * then deletes it. Throws if there is no valid token.
 *
 * @returns The user associated with the now deleted token.
 */
export const verifyTooManyLoginsToken = async (verifyMe: string) => {
	const condition = eq(tooManyLoginsToken.token, verifyMe);

	const token = await db.query.tooManyLoginsToken.findFirst({ where: condition });
	if (token === undefined) {
		error(400, 'Token does not exist');
	}
	await db.delete(tooManyLoginsToken).where(condition);
	if (!isWithinExpiration(token.expires)) {
		error(400, 'Token is expired');
	}

	return await auth.getUser(token.userId);
};
