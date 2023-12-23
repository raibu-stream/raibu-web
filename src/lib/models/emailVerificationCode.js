import { generateRandomString, isWithinExpiration } from 'lucia/utils';
import VerifyEmail from '$lib/email/VerifyEmail.svelte';
import { renderMjmlComponent } from '$lib/email/email';
import { sendEmail } from '../email/email';
import { error } from '@sveltejs/kit';
import { auth } from './db';
import mongodb from 'mongoose';

const ONE_MINUTE_IN_MS = 1000 * 60;
const THIRTY_MINUTES_IN_MS = ONE_MINUTE_IN_MS * 30;

const EmailVerificationCodeSchema = new mongodb.Schema(
	{
		user: {
			type: String,
			ref: 'User',
			required: true
		},
		code: {
			type: String,
			required: true,
			unique: true
		},
		expires: {
			type: Number,
			required: true
		},
		createdAt: {
			type: Date,
			expires: THIRTY_MINUTES_IN_MS / 1000,
			default: Date.now
		}
	},
	{
		statics: {
			async new(user) {
				const codes = await this.find({ user: user.userId }).exec();

				let code;
				if (codes.length > 0) {
					code = codes.find((token) => {
						return isWithinExpiration(token.expires - ONE_MINUTE_IN_MS * 10);
					});
				}

				if (code === undefined) {
					let randomCode = generateRandomString(6, '0123456789');
					code = await new this({
						code: randomCode,
						user: user.userId,
						expires: new Date().getTime() + THIRTY_MINUTES_IN_MS
					}).save();
				}

				const emailHtml = renderMjmlComponent(VerifyEmail, {
					verifyCode: code.code
				});
				sendEmail(emailHtml, 'Your email verification code', user.email);

				return code;
			},
			async verifyAndDelete(verifyMe, user) {
				const token = await this.findOne({ code: verifyMe, user: user.userId }).exec();
				if (token === null) {
					throw error(400, 'Token does not exist');
				}
				this.deleteOne({ code: verifyMe, user: user.userId }).exec();
				if (!isWithinExpiration(token.expires)) {
					throw error(400, 'Token is expired');
				}

				return await auth.getUser(token.user);
			}
		}
	}
);

export default EmailVerificationCodeSchema;
