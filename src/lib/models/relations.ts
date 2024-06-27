import { relations } from 'drizzle-orm';
import {
	customer,
	passwordResetToken,
	product,
	subscription,
	tooManyLoginsToken,
	user
} from './schema';

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
		references: [customer.stripeCustomerId]
	})
}));

export const customerRelations = relations(customer, ({ one }) => ({
	subscription: one(subscription, {
		fields: [customer.subscription],
		references: [subscription.id]
	})
}));

export const subscriptionRelations = relations(subscription, ({ one }) => ({
	product: one(product, {
		fields: [subscription.product],
		references: [product.id]
	})
}));
