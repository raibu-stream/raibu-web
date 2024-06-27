import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { fromZodError } from 'zod-validation-error';
import { z } from 'zod';
import { assert } from '$lib/utils';
import { stripeClient } from '$lib/stripe';
import Stripe from 'stripe';

export const POST: RequestHandler = async ({ locals }) => {
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
		error(401, {
			message: 'You must already be a customer'
		});
	}

	const res = await stripeClient.setupIntents.create({
		customer: locals.user.customer,
		usage: 'off_session'
	});
	assert(res.client_secret !== null);

	return new Response(JSON.stringify(res.client_secret), {
		status: 200
	});
};

const deleteInputSchema = z.object({
	paymentMethodId: z.string()
});

export const DELETE: RequestHandler = async ({ locals, request }) => {
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
		error(401, {
			message: 'You must already be a customer'
		});
	}

	const zodResult = deleteInputSchema.safeParse(await request.json());
	if (!zodResult.success) {
		error(400, fromZodError(zodResult.error).toString());
	}
	const { paymentMethodId } = zodResult.data;

	console.log(paymentMethodId);

	let paymentMethod;
	try {
		paymentMethod = await stripeClient.paymentMethods.retrieve(paymentMethodId);
	} catch (err) {
		if (err instanceof Stripe.errors.StripeError && err.code === 'resource_missing') {
			error(400, 'Payment method does not exist');
		} else {
			throw err;
		}
	}
	assert(typeof paymentMethod.customer === 'string');

	if (paymentMethod.customer !== locals.user.customer) {
		error(400, 'Payment method does not exist');
	}

	const customer = await stripeClient.customers.retrieve(locals.user.customer);
	assert(customer.deleted !== true);
	if (
		customer.subscriptions !== undefined &&
		customer.subscriptions.data.find(
			(subscription) => subscription.default_payment_method === paymentMethodId
		) !== undefined
	) {
		error(400, 'Payment method is in use');
	}

	await stripeClient.paymentMethods.detach(paymentMethodId);

	return new Response(JSON.stringify(undefined), {
		status: 200
	});
};
