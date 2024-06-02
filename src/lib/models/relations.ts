import { relations } from 'drizzle-orm';
import { customer, passwordResetToken, subscription, tooManyLoginsToken, user } from './schema';

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

export const userRelations = relations(user, ({ one }) => ({
	customer: one(customer, {
		fields: [user.customer],
		references: [customer.braintreeCustomerId]
	})
}));

export const customerRelations = relations(customer, ({ one }) => ({
	subscription: one(subscription, {
		fields: [customer.subscription],
		references: [subscription.id]
	})
}));
