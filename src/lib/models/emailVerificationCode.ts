import { generateRandomString, alphabet } from "oslo/crypto";
import { TimeSpan, createDate, isWithinExpirationDate } from "oslo";
import VerifyEmail from '$lib/email/VerifyEmail.svelte';
import { renderMjmlComponent, sendEmail } from '$lib/email/email';
import { error } from '@sveltejs/kit';
import { auth, db } from './db';
import type { User } from 'lucia';
import { and, eq, type InferSelectModel } from 'drizzle-orm';
import { emailVerificationCode } from './schema';
import { incrementOrCreateTimeout } from "./timeout";
import { EMAIL_VERIFICATION_VERIFY_TIMEOUT_DISCRIMINATOR } from "$lib/utils";

const ONE_MINUTE_IN_MS = 1000 * 60;

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
		where: eq(emailVerificationCode.user, user.id)
	});

	let code: EmailVerificationCode | undefined;
	if (codes.length > 0) {
		code = codes.find((code) => {
			return isWithinExpirationDate(new Date(code.expires.getTime() - ONE_MINUTE_IN_MS * 10));
		});
	}

	if (code === undefined) {
		const randomCode = generateRandomString(6, alphabet('0-9'));
		code = (
			await db
				.insert(emailVerificationCode)
				.values({
					code: randomCode,
					user: user.id,
					expires: createDate(new TimeSpan(30, "m"))
				})
				.returning()
		)[0];
	}

	const emailHtml = renderMjmlComponent(VerifyEmail, {
		verifyCode: code.code
	});
	sendEmail(emailHtml, 'Your email verification code', user.id);

	return code;
};

/**
 * Checks if the user has a {@linkcode emailVerificationCode} matching verifyMe that isn't expired,
 * then deletes it. Errors if there is no valid code.
 */
export const verifyEmailVerificationCode = async (verifyMe: string, user: User) => {
	const condition = and(
		eq(emailVerificationCode.user, user.id),
		eq(emailVerificationCode.code, verifyMe)
	);

	const code = await db.query.emailVerificationCode.findFirst({
		where: condition
	});
	if (code === undefined) {
		incrementOrCreateTimeout(user.id + EMAIL_VERIFICATION_VERIFY_TIMEOUT_DISCRIMINATOR)
		error(400, 'Code is expired or does not exist');
	}

	await db.delete(emailVerificationCode).where(condition);

	if (!isWithinExpirationDate(code.expires)) {
		incrementOrCreateTimeout(user.id + EMAIL_VERIFICATION_VERIFY_TIMEOUT_DISCRIMINATOR)
		error(400, 'Code is expired');
	}
};
