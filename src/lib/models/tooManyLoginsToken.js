import { generateRandomString, isWithinExpiration } from 'lucia/utils';
import tooManyLoginsEmail from '$lib/email/TooManyLoginsEmail.svelte';
import { renderMjmlComponent } from '$lib/email/email';
import { PUBLIC_RAIBU_URL } from '$env/static/public';
import { sendEmail } from '../email/email';
import { error } from '@sveltejs/kit';
import { auth } from './db';
import mongodb from 'mongoose';

const ONE_HOUR_IN_MS = 1000 * 60 * 60;
const FOUR_HOURS_IN_MS = ONE_HOUR_IN_MS * 4;

const tooManyLoginsTokenSchema = new mongodb.Schema(
	{
		user: {
			type: String,
			ref: 'User',
			required: true
		},
		token: {
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
			expires: FOUR_HOURS_IN_MS / 1000,
			default: Date.now
		}
	},
	{
		statics: {
			async new(user) {
				const tokens = await this.find({ user: user.userId }).exec();

				if (tokens.length > 0) {
					let existingToken = tokens.find((token) => {
						return isWithinExpiration(token.expires - ONE_HOUR_IN_MS);
					});
					if (existingToken !== undefined) {
						return existingToken;
					}
				}

				let randomString = generateRandomString(63);
				let token = await new this({
					token: randomString,
					user: user.userId,
					expires: new Date().getTime() + FOUR_HOURS_IN_MS
				}).save();

				const emailHtml = renderMjmlComponent(tooManyLoginsEmail, {
					unlockLink: `${PUBLIC_RAIBU_URL}/user/too-many-logins/${token.token}`
				});
				sendEmail(emailHtml, 'Unlock your account', user.email);

				return token;
			},
			async verifyAndDelete(verifyMe) {
				const token = await this.findOne({ token: verifyMe }).exec();
				if (token === null) {
					throw error(400, 'Token does not exist');
				}
				this.deleteOne({ token: token.token }).exec();
				if (!isWithinExpiration(token.expires)) {
					throw error(400, 'Token is expired');
				}

				return await auth.getUser(token.user);
			}
		}
	}
);

export default tooManyLoginsTokenSchema;
