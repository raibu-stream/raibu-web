import type { PageServerLoad } from './$types';
import { assert, createLoginRedirectURL } from '$lib/utils';
import { redirect } from '@sveltejs/kit';
import { db } from '$lib/models/db';
import { user } from '$lib/models/schema';
import { eq } from 'drizzle-orm';
import { zTier } from '$lib/tier';
import { getPaymentIntentStatus, stripeClient } from '$lib/stripe';
import { findOrCreateProduct } from '$lib/models/product';

export const load: PageServerLoad = async ({ locals, url }) => {
	if (locals.user === null) {
		redirect(302, createLoginRedirectURL(url));
	}
	if (!locals.user.isEmailVerified) {
		redirect(302, createLoginRedirectURL(url, '/user/email-verification'));
	}

	if (locals.user.customer !== null) {
		const userWithCustomer = await db.query.user.findFirst({
			where: eq(user.id, locals.user.id),
			with: {
				customer: true
			}
		});

		if (typeof userWithCustomer?.customer?.subscription === 'string') {
			redirect(302, '/user/billing');
		}
	} else {
		redirect(302, '/user/subscribe/byo');
	}

	const maybeTier = {
		maxConcurrentViewers: Number(url.searchParams.get('maxConcurrentViewers')),
		maxConcurrentStreams: Number(url.searchParams.get('maxConcurrentStreams')),
		maxBitrateInKbps: Number(url.searchParams.get('maxBitrateInKbps'))
	};
	const zodResult = zTier.safeParse(maybeTier);
	if (!zodResult.success) {
		redirect(302, '/user/subscribe/byo');
	}
	const tier = zodResult.data;

	const maybePaymentIntentId = url.searchParams.get('payment_intent');
	const maybePaymentIntentClientSecret = url.searchParams.get('setup_intent_client_secret');
	if (maybePaymentIntentId !== null && maybePaymentIntentClientSecret !== null) {
		const status = await getPaymentIntentStatus(maybePaymentIntentId);

		if (status === 'success') {
			redirect(302, '/user?payment-success=true');
		} else if (status === 'failed') {
			return {
				tier,
				clientSecret: maybePaymentIntentClientSecret,
				failed: true
			};
		}
	}

	const product = await findOrCreateProduct(tier);
	assert(typeof product.default_price === 'string');

	const subscription = await stripeClient.subscriptions.create({
		customer: locals.user.customer,
		payment_behavior: 'default_incomplete',
		payment_settings: {
			save_default_payment_method: 'on_subscription'
		},
		items: [
			{
				price: product.default_price
			}
		],
		expand: ['latest_invoice.payment_intent', 'pending_setup_intent']
	});
	assert(subscription.latest_invoice !== null);
	assert(typeof subscription.latest_invoice !== 'string');

	let clientSecret;
	if (subscription.latest_invoice.payment_intent === null) {
		assert(typeof subscription.pending_setup_intent !== 'string');
		assert(subscription.pending_setup_intent !== null);
		assert(subscription.pending_setup_intent.client_secret !== null);
		clientSecret = subscription.pending_setup_intent.client_secret;
	} else {
		assert(typeof subscription.latest_invoice.payment_intent !== 'string');
		assert(subscription.latest_invoice.payment_intent !== null);
		assert(subscription.latest_invoice.payment_intent.client_secret !== null);
		clientSecret = subscription.latest_invoice.payment_intent.client_secret;
	}

	return {
		tier,
		clientSecret,
		failed: false
	};
};
