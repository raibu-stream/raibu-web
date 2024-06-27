import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { zTier } from '$lib/tier';
import { fromZodError } from 'zod-validation-error';
import { z } from 'zod';
import { db } from '$lib/models/db';
import { customer as customerTable, subscription as subscriptionTable } from '$lib/models/schema';
import { eq } from 'drizzle-orm';
import { stripeClient } from '$lib/stripe';
import Stripe from 'stripe';
import { findOrCreateProduct } from '$lib/models/product';
import { assert } from '$lib/utils';

const patchInputSchema = z.object({
	paymentMethodToken: z.string().optional(),
	tier: zTier.optional()
});

export const PATCH: RequestHandler = async ({ locals, request }) => {
	if (locals.user === null) {
		error(401, {
			message: 'You are not logged in'
		});
	}
	if (!locals.user.isEmailVerified) {
		error(401, {
			message: "Your email's not verified"
		});
	}
	if (locals.user.customer === null) {
		error(400, {
			message: 'You must already be a customer'
		});
	}

	const customer = await db.query.customer.findFirst({
		where: eq(customerTable.stripeCustomerId, locals.user!.customer),
		with: {
			subscription: true
		}
	});

	if (customer === undefined) {
		error(400, {
			message: 'You must already be a customer'
		});
	}

	if (customer.subscription === null) {
		error(400, {
			message: 'You must already be subscribed'
		});
	}

	const zodResult = patchInputSchema.safeParse(await request.json());
	if (!zodResult.success) {
		error(400, fromZodError(zodResult.error).toString());
	}
	const requestData = zodResult.data;

	if (requestData.paymentMethodToken !== undefined) {
		try {
			const paymentMethod = await stripeClient.paymentMethods.retrieve(
				requestData.paymentMethodToken
			);

			if (paymentMethod.customer !== customer.stripeCustomerId) {
				error(400, 'Payment method not found');
			}
		} catch (err) {
			if (!(err instanceof Stripe.errors.StripeError && err.code === 'resource_missing')) {
				throw err;
			}

			error(400, 'Payment method not found');
		}

		await stripeClient.subscriptions.update(customer.subscription.id, {
			default_payment_method: requestData.paymentMethodToken
		});
	}

	if (requestData.tier !== undefined) {
		const product = await findOrCreateProduct(requestData.tier);

		await db.transaction(async (tx) => {
			assert(typeof product.default_price === 'string');

			await tx
				.update(subscriptionTable)
				.set({
					product: product.id
				})
				.where(eq(subscriptionTable.id, customer.subscription!.id));

			const subscription = await stripeClient.subscriptions.retrieve(customer.subscription!.id);
			await stripeClient.subscriptions.update(customer.subscription!.id, {
				items: [
					{
						id: subscription.items.data[0]!.id,
						deleted: true
					},
					{
						price: product.default_price
					}
				]
			});
		});
	}

	return new Response(JSON.stringify(undefined), {
		status: 200
	});
};
