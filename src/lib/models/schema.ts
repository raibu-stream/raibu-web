import {
	pgTable,
	bigint,
	varchar,
	boolean,
	primaryKey,
	text,
	timestamp,
	smallint
} from 'drizzle-orm/pg-core';

export const user = pgTable('user', {
	id: varchar('id', {
		length: 15
	}).primaryKey(),
	email: varchar('email', {
		length: 255
	}).notNull(),
	isEmailVerified: boolean('is_email_verified').notNull(),
	isLocked: boolean('is_locked').notNull(),
	isAdmin: boolean('is_admin').notNull().default(false)
});

export const session = pgTable('user_session', {
	id: varchar('id', {
		length: 128
	}).primaryKey(),
	userId: varchar('user_id', {
		length: 15
	})
		.notNull()
		.references(() => user.id),
	activeExpires: bigint('active_expires', {
		mode: 'number'
	}).notNull(),
	idleExpires: bigint('idle_expires', {
		mode: 'number'
	}).notNull()
});

export const key = pgTable('user_key', {
	id: varchar('id', {
		length: 255
	}).primaryKey(),
	userId: varchar('user_id', {
		length: 15
	})
		.notNull()
		.references(() => user.id),
	hashedPassword: varchar('hashed_password', {
		length: 255
	})
});

export const emailVerificationCode = pgTable(
	'email_verification_code',
	{
		userId: varchar('user_id', {
			length: 15
		})
			.notNull()
			.references(() => user.id),
		code: varchar('code', {
			length: 6
		}).notNull(),
		expires: bigint('expires', {
			mode: 'number'
		}).notNull()
	},
	(table) => {
		return {
			pk: primaryKey({ columns: [table.code, table.userId] })
		};
	}
);

export const passwordResetToken = pgTable('password_reset_token', {
	userId: varchar('user_id', {
		length: 15
	})
		.notNull()
		.references(() => user.id),
	token: varchar('token', {
		length: 63
	}).primaryKey(),
	expires: bigint('expires', {
		mode: 'number'
	}).notNull()
});

export const tooManyLoginsToken = pgTable('too_many_logins_token', {
	userId: varchar('user_id', {
		length: 15
	})
		.notNull()
		.references(() => user.id),
	token: varchar('token', {
		length: 63
	}).primaryKey(),
	expires: bigint('expires', {
		mode: 'number'
	}).notNull()
});

export const requestLog = pgTable('request_log', {
	userId: varchar('user_id', {
		length: 15
	}).references(() => user.id),
	routeId: text('route_id').notNull(),
	requestMethod: varchar('request_method', {
		length: 8
	}).notNull(),
	latencyInNs: bigint('latency_in_ns', { mode: 'bigint' }).notNull(),
	expires: bigint('expires', {
		mode: 'number'
	}).notNull(),
	requestDate: timestamp('request_date').defaultNow().notNull()
});

export const errorLog = pgTable('error_log', {
	errorId: varchar('error_id', { length: 64 }).primaryKey(),
	error: text('error').notNull(),
	errorDate: timestamp('error_date').defaultNow().notNull(),
	expires: bigint('expires', {
		mode: 'number'
	}).notNull()
});

export const timeOut = pgTable('time_out', {
	timerId: text('id').primaryKey(),
	expires: bigint('expires', {
		mode: 'number'
	}).notNull(),
	attempts: smallint("attempts")
})