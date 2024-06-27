import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { assert, createLoginRedirectURL } from '$lib/utils';
import { db } from '$lib/models/db';
import { customer as customerTable } from '$lib/models/schema';
import { eq } from 'drizzle-orm';
import { getPaymentIntentStatus, stripeClient } from '$lib/stripe';
import type Stripe from 'stripe';
import type { Tier } from '$lib/tier';

export const load: PageServerLoad = async ({ locals, url }) => {
	if (locals.user === null) {
		redirect(302, createLoginRedirectURL(url));
	}
	if (!locals.user.isEmailVerified) {
		redirect(302, createLoginRedirectURL(url, '/user/email-verification'));
	}
	if (locals.user.customer === null) {
		redirect(302, '/user/subscribe/byo');
	}

	const invoices = stripeClient.invoices
		.list({
			status: 'paid',
			customer: locals.user.customer
		})
		.then((invoices) => {
			return invoices.data.map((invoice) => {
				assert(invoice.effective_at !== null);
				return {
					id: invoice.id,
					date: new Date(invoice.effective_at * 1000),
					amount: invoice.total,
					status: invoice.status
				};
			});
		});
	const paymentMethods = stripeClient.customers
		.listPaymentMethods(locals.user.customer)
		.then((methods) => {
			return methods.data.map(formatPaymentMethod);
		});
	const subscription = getSubscription(locals.user.customer);

	const maybePaymentIntentId = url.searchParams.get('payment_intent');
	const maybePaymentIntentClientSecret = url.searchParams.get('setup_intent_client_secret');
	let failedPaymentIntent;
	if (maybePaymentIntentId !== null && maybePaymentIntentClientSecret !== null) {
		const status = await getPaymentIntentStatus(maybePaymentIntentId);

		if (status === 'failed') {
			failedPaymentIntent = {
				clientSecret: maybePaymentIntentClientSecret
			};
		}
	}

	return {
		invoices,
		paymentMethods,
		subscription,
		failedPaymentIntent
	};
};

const getSubscription = async (customerId: string) => {
	const customer = await db.query.customer.findFirst({
		where: eq(customerTable.stripeCustomerId, customerId),
		with: {
			subscription: {
				with: {
					product: true
				}
			}
		}
	});

	if (customer === undefined) {
		redirect(302, '/user/subscribe/byo');
	}
	if (customer.subscription === null) {
		return undefined;
	}

	const subscription = await stripeClient.subscriptions.retrieve(customer.subscription.id, {
		expand: ['default_payment_method']
	});
	assert(
		subscription.default_payment_method !== null &&
			typeof subscription.default_payment_method !== 'string'
	);

	return {
		token: subscription.id,
		status: subscription.status,
		paymentMethod: formatPaymentMethod(subscription.default_payment_method),
		nextBillAmount: (subscription as any).plan.amount,
		nextBillingDate: new Date(subscription.current_period_end * 1000),
		tier: customer.subscription.product as Tier
	};
};

const formatPaymentMethod = (method: Stripe.PaymentMethod) => {
	assert(method.type === 'card' || method.type === 'paypal' || method.type === 'sepa_debit');

	if (method.type === 'card') {
		return {
			id: method.id,
			type: 'card',
			last4: method.card!.last4,
			expiration: `${method.card!.exp_month}/${method.card!.exp_year}`
		};
	} else if (method.type === 'paypal') {
		return {
			id: method.id,
			type: 'paypal',
			maskedEmail: method.paypal!.payer_email!.replace(
				/^(.)(.*)(.@.*)$/,
				(_, a, b, c) => a + b.replace(/./g, '*') + c
			)
		};
	} else {
		return {
			id: method.id,
			type: 'sepa_debit',
			last4: method.sepa_debit!.last4
		};
	}
};
