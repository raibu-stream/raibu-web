import { Lucia } from 'lucia';
import { Argon2id } from 'oslo/password';
import { dev } from '$app/environment';
import { DrizzlePostgreSQLAdapter } from '@lucia-auth/adapter-drizzle';
import { RAIBU_DB_URL, RAIBU_ADMIN_PASS } from '$env/static/private';
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import * as schema from './schema';
import * as relations from './relations';
import { ToadScheduler, SimpleIntervalJob, AsyncTask } from 'toad-scheduler';
import { eq, lt, sql, type InferSelectModel } from 'drizzle-orm';
import { faker } from '@faker-js/faker';
import { arbitraryHandleError } from '../../hooks.server';

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
			tier: data.tier !== null ? db.query.tier.findFirst({ where: eq(schema.tier, data.tier) }) : undefined,
			isEmailVerified: data.isEmailVerified,
			isLocked: data.isLocked,
			isAdmin: data.isAdmin
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

type DatabaseUserAttributes = Omit<InferSelectModel<typeof schema.user>, 'id'>;

export const updateUserPassword = async (email: string, password: string) => {
	const hashedPassword = await new Argon2id().hash(password);
	const condition = eq(schema.user.id, email);

	return db.transaction(async (tx) => {
		const user = await tx.query.user.findFirst({
			where: condition
		});

		if (user === undefined) {
			return 'User does not exist';
		}

		await db.update(schema.user).set({ hashedPassword }).where(condition);
		await auth.invalidateUserSessions(user.id);
	});
};

export const createUser = async (
	email: string,
	password: string,
	attributes?: Partial<DatabaseUserAttributes>
) => {
	const hashedPassword = await new Argon2id().hash(password);

	return db.transaction(async (tx) => {
		const maybeUser = await tx.query.user.findFirst({
			where: eq(schema.user.id, email)
		});

		if (maybeUser !== undefined) {
			return;
		}

		return (
			await tx
				.insert(schema.user)
				.values({
					id: email,
					hashedPassword,
					...attributes
				})
				.returning()
		)[0];
	});
};

export const createSession = async (email: string) => {
	const session = await auth.createSession(email, {});
	return auth.createSessionCookie(session.id);
};

export const signInUser = async (email: string, password: string) => {
	const user = await db.query.user.findFirst({
		where: eq(schema.user.id, email)
	});
	if (user === undefined) {
		// For security, we hash the password anyways so that our response times
		// are the same with invalid username vs invalid password.
		await new Argon2id().hash(password);
		return 'User does not exist';
	}

	if (user.isLocked) {
		return 'User is locked';
	}

	const isPasswordValid = await new Argon2id().verify(user.hashedPassword, password);
	if (!isPasswordValid) {
		return 'Password is invalid';
	}

	return createSession(user.id);
};

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
