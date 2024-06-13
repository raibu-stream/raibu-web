import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { zTier, type Tier, getPricing } from '$lib/tier';
import { fromZodError } from 'zod-validation-error';
import { z } from 'zod';
import { braintreeGateway } from '$lib/braintree';
import type { Plan } from 'braintree';
import { db } from '$lib/models/db';
import {
	customer as customerTable,
	subscription as subscriptionTable,
	billingAddress,
} from '$lib/models/schema';
import { eq, type InferSelectModel } from 'drizzle-orm';

const postInputSchema = z.object({
	paymentMethodNonce: z.string(),
	tier: zTier
});

export const POST: RequestHandler = async ({ locals, request }) => {
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

	let address: InferSelectModel<typeof billingAddress>;
	if (locals.user.customer === null) {
		error(400, {
			message: 'You must already be a customer'
		});
	} else {
		const customer = await db.query.customer.findFirst({
			where: eq(customerTable.braintreeCustomerId, locals.user!.customer!),
			with: {
				billingAddress: true
			}
		});
		if (customer?.subscription !== null) {
			error(400, {
				message: 'You are already subscribed'
			});
		}

		address = customer.billingAddress;
	}

	const zodResult = postInputSchema.safeParse(await request.json());
	if (!zodResult.success) {
		error(400, fromZodError(zodResult.error).toString());
	}
	const requestData = zodResult.data;
	const tier: Tier = requestData.tier;

	const paymentMethod = await createPaymentMethod(
		requestData.paymentMethodNonce,
		address!,
		locals.user.customer
	);
	const plan = await createPlan(tier);
	const subscription = await createSubscription(plan.id, paymentMethod);

	try {
		await db.transaction(async (tx) => {
			await tx.insert(subscriptionTable).values({
				id: subscription.id,
				maxConcurrentStreams: tier.maxConcurrentStreams,
				maxConcurrentViewers: tier.maxConcurrentViewers,
				maxBitrateInKbps: tier.maxBitrateInKbps
			});

			await tx
				.update(customerTable)
				.set({
					subscription: subscription.id
				})
				.where(eq(customerTable.braintreeCustomerId, locals.user!.customer!));
		});
	} catch {
		error(
			500,
			"You were charged but something went wrong on our end. If you don't have access to your tier, please contact support. Don't attempt to checkout again."
		);
	}

	return new Response(JSON.stringify(undefined), {
		status: 200
	});
};

const createPaymentMethod = async (
	paymentMethodNonce: string,
	address: InferSelectModel<typeof billingAddress>,
	customerId: string
) => {
	const createPaymentMethodResult = await braintreeGateway.paymentMethod.create({
		customerId,
		paymentMethodNonce: paymentMethodNonce,
		billingAddress: {
			countryCodeAlpha2: address.country,
			extendedAddress: address.address2 ?? undefined,
			firstName: address.firstName,
			lastName: address.lastName,
			company: address.company ?? undefined,
			locality: address.city ?? undefined,
			postalCode: address.postalCode ?? undefined,
			region: address.zone ?? undefined,
			streetAddress: address.address1
		},
		options: {
			makeDefault: true,
			verifyCard: true
		}
	});

	if (!createPaymentMethodResult.success) {
		if (createPaymentMethodResult.errors.deepErrors().length !== 0) {
			throw {
				reason: 'Validation error on creating payment method',
				error: createPaymentMethodResult.errors
			};
		}

		if (
			(createPaymentMethodResult as any).verification?.status !== undefined &&
			(createPaymentMethodResult as any).verification.status !== 'verified'
		) {
			error(
				400,
				'There was a problem processing your payment information; please double check your payment information and try again'
			);
		}

		throw { reason: 'Weird error creating payment method', error: createPaymentMethodResult };
	}

	return createPaymentMethodResult.paymentMethod;
};

const createPlan = async (tier: Tier): Promise<Plan> => {
	const createPlanResult = await (braintreeGateway.plan as any).create({
		name: 'Raibu live stream service',
		description: `${tier.maxConcurrentStreams} concurrent streams with ${tier.maxConcurrentViewers} total viewers @ ${tier.maxBitrateInKbps} kbps`,
		neverExpires: true,
		price: getPricing(tier).finalTotal,
		billingFrequency: 1,
		currencyIsoCode: 'USD'
	});

	if (!createPlanResult.success) {
		throw { reason: 'Error on creating plan', error: createPlanResult };
	}

	return createPlanResult.plan;
};

const createSubscription = async (planId: string, paymentMethod: braintree.PaymentMethod) => {
	const createSubscriptionResult = await braintreeGateway.subscription.create({
		paymentMethodToken: paymentMethod.token,
		planId
	});

	if (!createSubscriptionResult.success) {
		if (createSubscriptionResult.errors.deepErrors().length !== 0) {
			throw {
				reason: 'Validation error on creating subscription',
				error: createSubscriptionResult.errors
			};
		}

		if (
			(createSubscriptionResult as any).transaction?.status !== undefined &&
			(createSubscriptionResult as any).transaction.status !== 'settled' &&
			(createSubscriptionResult as any).transaction.status !== 'settling' &&
			(createSubscriptionResult as any).transaction.status !== 'authorizing' &&
			(createSubscriptionResult as any).transaction.status !== 'authorized' &&
			(createSubscriptionResult as any).transaction.status !== 'settlement_confirmed' &&
			(createSubscriptionResult as any).transaction.status !== 'submitted_for_settlement' &&
			(createSubscriptionResult as any).transaction.status !== 'settlement_pending'
		) {
			error(
				400,
				'There was a problem processing your payment information; please double check your payment information and try again'
			);
		}

		throw { reason: 'Weird error while subscribing', error: createSubscriptionResult };
	}

	return createSubscriptionResult.subscription;
};

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
		where: eq(customerTable.braintreeCustomerId, locals.user!.customer),
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
		const res = await braintreeGateway.subscription.update(customer.subscription.id, {
			paymentMethodToken: requestData.paymentMethodToken
		});

		if (!res.success) {
			error(400, "An error occurred while updating the subscription");
		}
	}

	if (requestData.tier !== undefined) {
		const plan = await createPlan(requestData.tier);
		const res = await braintreeGateway.subscription.update(customer.subscription.id, {
			planId: plan.id,
			price: plan.price,
			options: {
				prorateCharges: true
			}
		});

		if (!res.success) {
			error(400, "An error occurred while updating the subscription");
		}
		const subscription = res.subscription;

		try {
			await db.transaction(async (tx) => {
				await tx.insert(subscriptionTable).values({
					id: subscription.id,
					maxConcurrentStreams: requestData.tier!.maxConcurrentStreams,
					maxConcurrentViewers: requestData.tier!.maxConcurrentViewers,
					maxBitrateInKbps: requestData.tier!.maxBitrateInKbps
				});

				await tx
					.update(customerTable)
					.set({
						subscription: subscription.id
					})
					.where(eq(customerTable.braintreeCustomerId, locals.user!.customer!));
			});
		} catch {
			error(
				500,
				"Your subscription was updated but something went wrong on our end. If you don't have access to your tier, please contact support."
			);
		}
	}

	return new Response(JSON.stringify(undefined), {
		status: 200
	});
};
