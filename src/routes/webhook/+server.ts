import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { RAIBU_STRIPE_WEBHOOK_SECRET } from '$env/static/private';
import { stripeClient } from '$lib/stripe';
import type Stripe from 'stripe';
import { db } from '$lib/models/db';
import {
	product as productTable,
	customer as customerTable,
	subscription as subscriptionTable
} from '$lib/models/schema';
import { eq } from 'drizzle-orm';
import { assert } from '$lib/utils';
import { arbitraryHandleError } from '../../hooks.server';

export const POST: RequestHandler = async ({ request }) => {
	const signature = request.headers.get('stripe-signature');
	if (signature === null) {
		error(400);
	}

	let event: Stripe.Event;
	try {
		event = await stripeClient.webhooks.constructEventAsync(
			await request.text(),
			signature,
			RAIBU_STRIPE_WEBHOOK_SECRET
		);
	} catch (err: any) {
		if ('message' in err) {
			error(400, err.message);
		} else {
			error(400);
		}
	}

	switch (event.type) {
		case 'customer.subscription.created':
			updateSubscription(event.data.object).catch(arbitraryHandleError);
			break;
		case 'customer.subscription.updated':
			updateSubscription(event.data.object).catch(arbitraryHandleError);
			break;
		// case "customer.subscription.deleted":
		// 	updateSubscription(event.data.object).catch(arbitraryHandleError);
		// 	break;
	}

	return new Response(JSON.stringify(undefined), {
		status: 200
	});
};

const updateSubscription = async (subscription: Stripe.Subscription) => {
	if (subscription.status === 'active') {
		await db.transaction(async (tx) => {
			assert(subscription.items.data.length >= 1, 'Subscription has at least one item');
			const item = subscription.items.data[0];
			assert(
				typeof item.price.product === 'string',
				"Subscription item didn't have product id while updating subscription"
			);
			const product = await tx.query.product.findFirst({
				where: eq(productTable.id, item.price.product)
			});
			assert(product !== undefined, "Tried to update subscription with product that doesn't exist");

			assert(
				typeof subscription.customer === 'string',
				"Subscription didn't have customer id while updating subscription"
			);
			await tx
				.insert(subscriptionTable)
				.values({
					id: subscription.id,
					product: product.id
				})
				.onConflictDoUpdate({
					target: subscriptionTable.id,
					set: {
						product: product.id
					}
				});

			await tx
				.update(customerTable)
				.set({
					subscription: subscription.id
				})
				.where(eq(customerTable.stripeCustomerId, subscription.customer));
		});
	}
};
