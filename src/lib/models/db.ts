import { lucia } from 'lucia';
import { sveltekit } from 'lucia/middleware';
import { dev } from '$app/environment';
import { postgres as postgresAdapter } from '@lucia-auth/adapter-postgresql';
import { RAIBU_DB_URL } from '$env/static/private';
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import * as schema from './schema';
import { ToadScheduler, SimpleIntervalJob, AsyncTask } from 'toad-scheduler';
import { lt } from 'drizzle-orm';
import { faker } from '@faker-js/faker';

// You should use npm run db-push in dev
if (!dev) {
	const migrationClient = postgres(RAIBU_DB_URL, {
		ssl: dev ? 'prefer' : 'require',
		max: 1
	});
	await migrate(drizzle(migrationClient), { migrationsFolder: 'drizzle' });
	await migrationClient.end();
	console.log('Migrated database successfully');
}

const queryClient = postgres(RAIBU_DB_URL, {
	ssl: dev ? 'prefer' : 'require'
});
export const db = drizzle(queryClient, { schema });

export const auth = lucia({
	env: dev ? 'DEV' : 'PROD',
	middleware: sveltekit(),
	adapter: postgresAdapter(queryClient, {
		user: 'user',
		key: 'user_key',
		session: 'user_session'
	}),
	getUserAttributes: (data) => {
		return {
			email: data.email,
			isEmailVerified: data.is_email_verified,
			isLocked: data.is_locked,
			isAdmin: data.is_admin
		};
	}
});
export type Auth = typeof auth;
console.log('Connected to database');

// eslint-disable-next-line no-constant-condition
if (dev && false) {
	await Promise.all(
		Object.values(schema).map((table) => {
			return db.delete(table);
		})
	);
	await Promise.all(
		[...Array(20)].map(async () => {
			const email = faker.internet.email().toLowerCase();
			await auth.createUser({
				key: {
					providerId: 'email',
					providerUserId: email,
					password: faker.internet.password()
				},
				attributes: {
					email,
					is_email_verified: false,
					is_locked: false,
					is_admin: false
				}
			});
		})
	);
	console.log('Fake users inserted');
}

const scheduler = new ToadScheduler();
const ttlTask = new AsyncTask('db ttl', async () => {
	Promise.all([
		db
			.delete(schema.emailVerificationCode)
			.where(lt(schema.emailVerificationCode.expires, new Date().getTime())),
		db
			.delete(schema.passwordResetToken)
			.where(lt(schema.passwordResetToken.expires, new Date().getTime())),
		db
			.delete(schema.tooManyLoginsToken)
			.where(lt(schema.tooManyLoginsToken.expires, new Date().getTime()))
	]);
});
const ttlJob = new SimpleIntervalJob({ minutes: 1 }, ttlTask);
scheduler.addSimpleIntervalJob(ttlJob);
