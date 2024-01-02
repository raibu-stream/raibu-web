import { generateRandomString, isWithinExpiration } from 'lucia/utils';
import VerifyEmail from '$lib/email/VerifyEmail.svelte';
import { renderMjmlComponent, sendEmail } from '$lib/email/email';
import { error } from '@sveltejs/kit';
import { auth, db } from './db';
import type { User } from 'lucia';
import { and, eq, type InferSelectModel } from 'drizzle-orm';
import { emailVerificationCode } from './schema';

const ONE_MINUTE_IN_MS = 1000 * 60;
const THIRTY_MINUTES_IN_MS = ONE_MINUTE_IN_MS * 30;

export type EmailVerificationCode = InferSelectModel<typeof emailVerificationCode>;

/**
 * Finds an {@linkcode emailVerificationCode} associated with the user,
 * and returns if one exists and it won't be expired after 10 minutes from now.
 * Otherwise, create a new code and email it to the user.
 *
 * @returns The newly created or found code.
 */
export const newEmailVerificationCode = async (user: User): Promise<EmailVerificationCode> => {
	const codes = await db.query.emailVerificationCode.findMany({
		where: eq(emailVerificationCode.userId, user.userId)
	});

	let code: EmailVerificationCode | undefined;
	if (codes.length > 0) {
		code = codes.find((code) => {
			return isWithinExpiration(code.expires - ONE_MINUTE_IN_MS * 10);
		});
	}

	if (code === undefined) {
		const randomCode = generateRandomString(6, '0123456789');
		code = (
			await db
				.insert(emailVerificationCode)
				.values({
					code: randomCode,
					userId: user.userId,
					expires: new Date().getTime() + THIRTY_MINUTES_IN_MS
				})
				.returning()
		)[0];
	}

	const emailHtml = renderMjmlComponent(VerifyEmail, {
		verifyCode: code.code
	});
	sendEmail(emailHtml, 'Your email verification code', user.email);

	return code;
};

/**
 * Checks if the user has a {@linkcode emailVerificationCode} matching verifyMe that isn't expired,
 * then deletes it. Throws if there is no valid code.
 *
 * @returns The user associated with the now deleted code.
 */
export const verifyEmailVerificationCode = async (verifyMe: string, user: User): Promise<User> => {
	const condition = and(
		eq(emailVerificationCode.userId, user.userId),
		eq(emailVerificationCode.code, verifyMe)
	);

	const code = await db.query.emailVerificationCode.findFirst({
		where: condition
	});
	if (code === undefined) {
		throw error(400, 'Code is expired or does not exist');
	}

	await db.delete(emailVerificationCode).where(condition);

	if (!isWithinExpiration(code.expires)) {
		throw error(400, 'Code is expired');
	}

	return await auth.getUser(code.userId);
};
