import { lucia } from 'lucia';
import { sveltekit } from 'lucia/middleware';
import { dev } from '$app/environment';
import { mongoose } from '@lucia-auth/adapter-mongoose';
import mongodb from 'mongoose';
import { RAIBU_DB_HOST, RAIBU_DB_USER, RAIBU_DB_PASSWORD } from '$env/static/private';
import EmailVerificationCodeSchema from './emailVerificationCode';
import TooManyLoginsTokenSchema from './tooManyLoginsToken';
import passwordResetTokenSchema from './passwordResetToken';
import type { KeyDoc } from '@lucia-auth/adapter-mongoose/dist/docs';

// @ts-expect-error Mongoose state somehow carries-over over reloads and it causes errors when we remake the models.
// So we clear out the models and connection to prevent this
mongodb.models = [];

export const User = mongodb.model(
	'User',
	new mongodb.Schema(
		{
			_id: {
				type: String,
				required: true
			},
			email: {
				type: String,
				required: true,
				unique: true,
				trim: true,
				lowercase: true
			},
			isEmailVerified: {
				type: Boolean,
				required: true
			},
			isLocked: {
				type: Boolean,
				required: true,
				default: false
			}
		},
		{ _id: false }
	)
);
const Key = mongodb.model(
	'Key',
	new mongodb.Schema(
		{
			_id: {
				type: String,
				required: true
			},
			user_id: {
				type: String,
				required: true
			},
			hashed_password: String
		} as unknown as KeyDoc,
		{ _id: false }
	)
);
export const Session = mongodb.model(
	'Session',
	new mongodb.Schema(
		{
			_id: {
				type: String,
				required: true
			},
			user_id: {
				type: String,
				required: true
			},
			active_expires: {
				type: Number,
				required: true
			},
			idle_expires: {
				type: Number,
				required: true
			}
		},
		{ _id: false }
	)
);

export const EmailVerificationCode = mongodb.model(
	'EmailVerificationCode',
	EmailVerificationCodeSchema
);
export const TooManyLoginsToken = mongodb.model('TooManyLoginsToken', TooManyLoginsTokenSchema);
export const passwordResetToken = mongodb.model('passwordResetToken', passwordResetTokenSchema);

mongodb
	.connect(`mongodb://${RAIBU_DB_HOST}/${dev ? 'raibu_test' : 'raibu'}`, {
		auth: {
			password: RAIBU_DB_PASSWORD,
			username: RAIBU_DB_USER
		},
		authSource: 'admin',
		tls: true
	})
	.then(() => console.log('Connected to DB'));

export const auth = lucia({
	env: dev ? 'DEV' : 'PROD',
	middleware: sveltekit(),
	adapter: mongoose({
		User,
		Key,
		Session
	}),
	getUserAttributes: (data) => {
		return {
			email: data.email,
			isEmailVerified: data.isEmailVerified,
			isLocked: data.isLocked
		};
	}
});
export type Auth = typeof auth;

// if (dev) {
// 	Promise.all([
// 		User.deleteMany(undefined),
// 		Key.deleteMany(undefined),
// 		Session.deleteMany(undefined)
// 	]).then(() => console.log('DB Cleared'));
// }
