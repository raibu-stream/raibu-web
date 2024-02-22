import { relations } from 'drizzle-orm';
import { passwordResetToken, tooManyLoginsToken, user } from './schema';

export const tooManyLoginsTokenRelations = relations(tooManyLoginsToken, ({ one }) => ({
	user: one(user, {
		fields: [tooManyLoginsToken.user],
		references: [user.id]
	})
}));

export const passwordResetTokenRelations = relations(passwordResetToken, ({ one }) => ({
	user: one(user, {
		fields: [passwordResetToken.user],
		references: [user.id]
	})
}));
