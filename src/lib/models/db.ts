import { Lucia } from 'lucia';
import { dev } from '$app/environment';
import { DrizzlePostgreSQLAdapter } from '@lucia-auth/adapter-drizzle';
import { RAIBU_DB_URL, RAIBU_ADMIN_PASS } from '$env/static/private';
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import * as schema from './schema';
import * as relations from './relations';
import { ToadScheduler, SimpleIntervalJob, AsyncTask } from 'toad-scheduler';
import { lt, sql, type InferSelectModel } from 'drizzle-orm';
import { faker } from '@faker-js/faker';
import { arbitraryHandleError } from '../../hooks.server';
import { createUser } from './user';

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
export const db = drizzle(queryClient, { schema: { ...schema, ...relations } });

const adapter = new DrizzlePostgreSQLAdapter(db, schema.session, schema.user);

export const auth = new Lucia(adapter, {
	getUserAttributes: (data) => {
		return {
			customer: data.customer,
			isEmailVerified: data.isEmailVerified,
			isLocked: data.isLocked,
			isAdmin: data.isAdmin,
			signupDate: data.signupDate
		};
	},
	sessionCookie: {
		attributes: {
			secure: !dev
		}
	}
});

export type Auth = typeof auth;

declare module 'lucia' {
	interface Register {
		Lucia: typeof auth;
		DatabaseSessionAttributes: DatabaseSessionAttributes;
		DatabaseUserAttributes: DatabaseUserAttributes;
	}
}

interface DatabaseSessionAttributes { }

export type DatabaseUserAttributes = Omit<InferSelectModel<typeof schema.user>, 'id'>;

await createUser('contact@raibu.stream', RAIBU_ADMIN_PASS, {
	isEmailVerified: true,
	isLocked: false,
	isAdmin: true
});

console.log('Connected to database');

// eslint-disable-next-line no-constant-condition
if (dev && false) {
	await Promise.all(
		Object.values(schema).map((table) => {
			// eslint-disable-next-line drizzle/enforce-delete-with-where
			return db.delete(table);
		})
	);
	await Promise.all(
		[...Array(20)].map(async () => {
			const email = faker.internet.email().toLowerCase();
			await createUser(email, faker.internet.password());
		})
	);
	console.log('Fake users inserted');
}

const scheduler = new ToadScheduler();
const ttlTask = new AsyncTask('db ttl', async () => {
	Promise.all([
		db
			.delete(schema.emailVerificationCode)
			.where(lt(schema.emailVerificationCode.expires, sql`now()`)),
		db.delete(schema.passwordResetToken).where(lt(schema.passwordResetToken.expires, sql`now()`)),
		db.delete(schema.tooManyLoginsToken).where(lt(schema.tooManyLoginsToken.expires, sql`now()`)),
		db.delete(schema.timeOut).where(lt(schema.timeOut.expires, sql`now()`)),
		auth.deleteExpiredSessions()
	]).catch(arbitraryHandleError);
});
const ttlJob = new SimpleIntervalJob({ minutes: 1 }, ttlTask);
scheduler.addSimpleIntervalJob(ttlJob);
