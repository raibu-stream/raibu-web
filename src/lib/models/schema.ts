import {
	pgTable,
	bigint,
	varchar,
	boolean,
	primaryKey,
	text,
	timestamp,
	smallint,
	integer,
	serial,
	char
} from 'drizzle-orm/pg-core';

export const user = pgTable('user', {
	id: varchar('email', {
		length: 255
	}).primaryKey(),
	hashedPassword: varchar('hashed_password', {
		length: 255
	}).notNull(),
	customer: text('customer').references(() => customer.braintreeCustomerId),
	isEmailVerified: boolean('is_email_verified').notNull().default(false),
	isLocked: boolean('is_locked').notNull().default(false),
	isAdmin: boolean('is_admin').notNull().default(false),
	signupDate: timestamp('signup_date').defaultNow().notNull()
});

export const session = pgTable('user_session', {
	id: varchar('id', {
		length: 128
	}).primaryKey(),
	userId: varchar('user', {
		length: 255
	})
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' }),
	expiresAt: timestamp('expires_at', {
		withTimezone: true
	}).notNull()
});

export const emailVerificationCode = pgTable(
	'email_verification_code',
	{
		user: varchar('user', {
			length: 255
		})
			.notNull()
			.references(() => user.id, { onDelete: 'cascade' }),
		code: varchar('code', {
			length: 6
		}).notNull(),
		expires: timestamp('expires').notNull()
	},
	(table) => {
		return {
			pk: primaryKey({ columns: [table.code, table.user] })
		};
	}
);

export const passwordResetToken = pgTable('password_reset_token', {
	user: varchar('user', {
		length: 255
	})
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' }),
	token: varchar('token', {
		length: 63
	}).primaryKey(),
	expires: timestamp('expires').notNull()
});

export const tooManyLoginsToken = pgTable('too_many_logins_token', {
	user: varchar('user', {
		length: 255
	})
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' }),
	token: varchar('token', {
		length: 63
	}).primaryKey(),
	expires: timestamp('expires').notNull()
});

export const requestLog = pgTable('request_log', {
	user: varchar('user', {
		length: 255
	}).references(() => user.id, { onDelete: 'set null' }),
	routeId: text('route_id').notNull(),
	requestMethod: varchar('request_method', {
		length: 8
	}).notNull(),
	latencyInNs: bigint('latency_in_ns', { mode: 'bigint' }).notNull(),
	expires: timestamp('expires').notNull(),
	requestDate: timestamp('request_date').defaultNow().notNull()
});

export const errorLog = pgTable('error_log', {
	errorId: varchar('error_id', { length: 64 }).primaryKey(),
	error: text('error').notNull(),
	errorDate: timestamp('error_date').defaultNow().notNull(),
	expires: timestamp('expires').notNull()
});

export const timeOut = pgTable('time_out', {
	timerId: text('id').primaryKey(),
	expires: timestamp('expires').notNull(),
	attempts: smallint('attempts')
});

export const siteConfig = pgTable('site_config', {
	id: text('id').primaryKey(),
	value: varchar('value', {
		length: 255
	})
});

export const customer = pgTable('customer', {
	braintreeCustomerId: text('braintree_customer_id').primaryKey(),
	subscription: text('subscription_id').references(() => subscription.id, { onDelete: 'cascade' }),
	billingAddress: serial('address_id')
		.references(() => billingAddress.id, { onDelete: 'cascade' })
		.notNull()
});

export const billingAddress = pgTable('billing_address', {
	id: serial('id').primaryKey(),
	firstName: varchar('first_name', {
		length: 255
	}).notNull(),
	lastName: varchar('last_name', {
		length: 255
	}).notNull(),
	country: char('country', { length: 2 }).notNull(),
	address1: varchar('address_1', {
		length: 255
	}).notNull(),
	address2: varchar('address_2', {
		length: 255
	}),
	city: varchar('city', {
		length: 255
	}),
	zone: varchar('zone', {
		length: 255
	}),
	postalCode: varchar('postal_code', {
		length: 10
	})
});

export const subscription = pgTable('subscription', {
	id: text('id').primaryKey(),
	maxConcurrentStreams: integer('max_concurrent_streams').notNull(),
	maxConcurrentViewers: integer('max_concurrent_viewers').notNull(),
	maxBitrateInKbps: integer('max_bitrate').notNull()
});
