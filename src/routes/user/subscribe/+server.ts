import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { zTier, type Tier, getPricing } from '$lib/tier';
import { fromZodError } from 'zod-validation-error';
import { z } from 'zod';
import AddressFormatter from '@shopify/address';
import { address } from '$lib/utils';
import { braintreeGateway } from '$lib/braintree';
import type { CreditCardCreateRequest, Plan } from 'braintree';
import type { User } from 'lucia';
import { db } from '$lib/models/db';
import {
	customer as customerTable,
	user as userTable,
	subscription as subscriptionTable
} from '$lib/models/schema';
import { eq } from 'drizzle-orm';

const postInputSchema = z.object({
	paymentMethodNonce: z.string(),
	tier: zTier
});

export const POST: RequestHandler = async ({ locals, request, getClientAddress }) => {
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
	if (locals.user.customer !== null) {
		await db.transaction(async (tx) => {
			const customer = await tx.query.customer.findFirst({
				where: eq(customerTable.braintreeCustomerId, locals.user!.customer!)
			});
			if (customer?.subscription !== null) {
				error(400, {
					message: 'You are already subscribed'
				});
			}

			await braintreeGateway.customer.delete(locals.user!.customer!).catch(() => {});
			await tx.update(userTable).set({
				customer: null
			});
			await tx
				.delete(customerTable)
				.where(eq(customerTable.braintreeCustomerId, locals.user!.customer!));
		});
	}

	const addressFormatter = new AddressFormatter('en');
	const zSchema = postInputSchema.extend({
		address: address(await addressFormatter.getCountries())
	});
	const zodResult = zSchema.safeParse(await request.json());
	if (!zodResult.success) {
		error(400, fromZodError(zodResult.error).toString());
	}
	const requestData = zodResult.data;
	const tier: Tier = requestData.tier;

	const customer = await createCustomer(request, requestData, locals.user, getClientAddress);
	const plan = await createPlan(tier);
	const subscription = await createSubscription(plan.id, locals.user, customer);

	try {
		await db.transaction(async (tx) => {
			await tx.insert(subscriptionTable).values({
				id: subscription.id,
				maxConcurrentStreams: tier.maxConcurrentStreams,
				maxConcurrentViewers: tier.maxConcurrentViewers,
				maxBitrateInKbps: tier.maxBitrateInKbps
			});

			await tx.update(customerTable).set({
				subscription: subscription.id
			});
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

const createCustomer = async (
	request: Request,
	requestData: any,
	user: User,
	getClientAddress: () => string
) => {
	const userAgent = request.headers.get('user-agent');

	const createCustomerResult = await braintreeGateway.customer.create({
		firstName: requestData.address.firstName,
		lastName: requestData.address.lastName,
		email: user.id,
		paymentMethodNonce: requestData.paymentMethodNonce,
		riskData: {
			customerIp: getClientAddress(),
			customerBrowser:
				userAgent !== null ? (userAgent.length <= 255 ? userAgent : undefined) : undefined
		},
		creditCard: {
			billingAddress: {
				countryCodeAlpha2: requestData.address.country,
				extendedAddress: requestData.address.address2,
				firstName: requestData.address.firstName,
				lastName: requestData.address.lastName,
				locality: requestData.address.city,
				postalCode: requestData.address.postalCode,
				region: requestData.address.zone,
				streetAddress: requestData.address.address1
			},
			options: {
				makeDefault: true,
				verifyCard: true
			}
		} as CreditCardCreateRequest
	});

	if (!createCustomerResult.success) {
		if (createCustomerResult.errors.deepErrors().length !== 0) {
			throw { reason: 'Validation error on creating customer', error: createCustomerResult.errors };
		}

		if (
			(createCustomerResult as any).verification?.status !== undefined &&
			(createCustomerResult as any).verification.status !== 'verified'
		) {
			error(
				400,
				'There was a problem processing your payment information; please double check your payment information and try again'
			);
		}

		throw { reason: 'Weird error creating customer', error: createCustomerResult };
	}

	if (
		createCustomerResult.customer.paymentMethods === undefined ||
		createCustomerResult.customer.paymentMethods[0] === undefined
	) {
		throw { reason: 'No payment methods on newly created customer', error: createCustomerResult };
	}

	await db.transaction(async (tx) => {
		await tx.insert(customerTable).values({
			braintreeCustomerId: createCustomerResult.customer.id
		});
		await tx.update(userTable).set({
			customer: createCustomerResult.customer.id
		});
	});

	return createCustomerResult.customer;
};

const createPlan = async (tier: Tier): Promise<Plan> => {
	const pricing = getPricing(tier);
	const createPlanResult = await (braintreeGateway.plan as any).create({
		name: 'Raibu live stream service',
		description: `${tier.maxConcurrentStreams} concurrent streams with ${tier.maxConcurrentViewers} total viewers @ ${tier.maxBitrateInKbps} kbps`,
		neverExpires: true,
		price: pricing.discountedTotal ?? pricing.total,
		billingFrequency: 1,
		currencyIsoCode: 'USD'
	});

	if (!createPlanResult.success) {
		throw { reason: 'Error on creating plan', error: createPlanResult };
	}

	return createPlanResult.plan;
};

const createSubscription = async (planId: string, user: User, customer: braintree.Customer) => {
	const createSubscriptionResult = await braintreeGateway.subscription.create({
		paymentMethodToken: customer.paymentMethods![0]!.token,
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
