import { lucia } from 'lucia';
import { sveltekit } from 'lucia/middleware';
import { dev } from '$app/environment';
import { mongoose } from '@lucia-auth/adapter-mongoose';
import mongodb from 'mongoose';
import { RAIBU_DB_HOST, RAIBU_DB_USER, RAIBU_DB_PASSWORD } from '$env/static/private';

// Mongoose state somehow carries-over over reloads and it causes errors when we remake the models.
// So we clear out the models and connection to prevent this.
mongodb.models = [];
mongodb.connection.close();

const User = mongodb.model(
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
		},
		{ _id: false }
	)
);
const Session = mongodb.model(
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
			email: data.email
		};
	}
});

mongodb.connect(`mongodb://${RAIBU_DB_HOST}/${dev ? 'raibu_test' : 'raibu'}`, {
	auth: {
		password: RAIBU_DB_PASSWORD,
		username: RAIBU_DB_USER
	},
	authSource: 'admin',
	tls: true
});