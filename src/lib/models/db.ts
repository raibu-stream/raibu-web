import { lucia } from 'lucia';
import { sveltekit } from 'lucia/middleware';
import { dev } from '$app/environment';
import { postgres as postgresAdapter } from '@lucia-auth/adapter-postgresql';
import { RAIBU_DB_URL } from '$env/static/private';
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import * as schema from './schema';

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
			isEmailVerified: data.isEmailVerified,
			isLocked: data.isLocked
		};
	}
});
export type Auth = typeof auth;
console.log('Connected to database');

// if (dev) {
// 	await Promise.all(Object.values(schema).map(table => {
// 		return db.delete(table);
// 	}));
// }
