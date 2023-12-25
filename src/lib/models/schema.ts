import { pgTable, bigint, varchar, boolean, primaryKey } from 'drizzle-orm/pg-core';

export const user = pgTable('user', {
	id: varchar('id', {
		length: 15
	}).primaryKey(),
	email: varchar('email', {
		length: 255
	}).notNull(),
	isEmailVerified: boolean('isEmailVerified').notNull(),
	isLocked: boolean('isLocked').notNull()
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

export const tooManyLoginsToken = pgTable('password_reset_token', {
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
