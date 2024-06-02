import 'dotenv/config';
import type { Config } from 'drizzle-kit';

const connectionString = process.env.RAIBU_DB_URL;

if (connectionString === undefined) {
	throw new Error('Environment variable RAIBU_DB_URL is not set');
}

export default {
	schema: './src/lib/models/schema.ts',
	out: './drizzle',
	dialect: 'postgresql',
	dbCredentials: {
		url: connectionString
	}
} satisfies Config;
