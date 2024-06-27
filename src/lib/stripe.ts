import { RAIBU_STRIPE_PRIVATE_KEY } from '$env/static/private';
import Stripe from 'stripe';
import { assert } from './utils';

export const stripeClient = new Stripe(RAIBU_STRIPE_PRIVATE_KEY, {
	typescript: true
});

export const getPaymentIntentStatus = async (paymentIntentId: string) => {
	let paymentIntent;
	try {
		paymentIntent = await stripeClient.paymentIntents.retrieve(paymentIntentId);
	} catch (err) {
		if (!(err instanceof Stripe.errors.StripeError && err.code === 'resource_missing')) {
			throw err;
		}
		return 'remake';
	}

	assert(
		paymentIntent.status !== 'requires_capture' && paymentIntent.status !== 'requires_confirmation'
	);
	if (paymentIntent.status === 'processing' || paymentIntent.status === 'succeeded') {
		return 'success';
	}

	if (paymentIntent.status === 'requires_action' || paymentIntent.status === 'canceled') {
		return 'remake';
	}

	return 'failed';
};
