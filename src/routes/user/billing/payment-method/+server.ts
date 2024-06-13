import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { fromZodError } from 'zod-validation-error';
import { z } from 'zod';
import { braintreeGateway } from '$lib/braintree';
import { db } from '$lib/models/db';
import { billingAddress, customer as customerTable } from '$lib/models/schema';
import { eq, type InferSelectModel } from 'drizzle-orm';
import type { User } from 'lucia';

const postInputSchema = z.object({
	paymentMethodNonce: z.string()
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

	const address = await getAddress(locals.user);

	const zodResult = postInputSchema.safeParse(await request.json());
	if (!zodResult.success) {
		error(400, fromZodError(zodResult.error).toString());
	}
	const requestData = zodResult.data;

	await createPaymentMethod(requestData.paymentMethodNonce, address!, locals.user.customer!);

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
			locality: address.city ?? undefined,
			postalCode: address.postalCode ?? undefined,
			region: address.zone ?? undefined,
			streetAddress: address.address1
		},
		options: {
			verifyCard: true,
			failOnDuplicatePaymentMethod: true
		}
	});

	if (!createPaymentMethodResult.success) {
		if (
			createPaymentMethodResult.errors.deepErrors().find((err) => err.code === '81724') !==
			undefined
		) {
			error(400, 'This payment method is already in use');
		}
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

const deleteInputSchema = z.object({
	paymentMethodToken: z.string()
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

	await getAddress(locals.user);

	const zodResult = deleteInputSchema.safeParse(await request.json());
	if (!zodResult.success) {
		error(400, fromZodError(zodResult.error).toString());
	}
	const requestData = zodResult.data;

	let paymentMethod;
	try {
		paymentMethod = await braintreeGateway.paymentMethod.find(requestData.paymentMethodToken);
	} catch (err) {
		if ((err as any).type === 'notFoundError') {
			error(400, 'Payment method does not exist');
		} else {
			throw err;
		}
	}

	if (paymentMethod.subscriptions?.length !== 0) {
		error(400, 'Payment method is in use');
	}

	await braintreeGateway.paymentMethod.delete(paymentMethod.token);

	return new Response(JSON.stringify(undefined), {
		status: 200
	});
};

const getAddress = async (user: User) => {
	if (user.customer === null) {
		error(400, {
			message: 'You must already be a customer'
		});
	} else {
		return await db.transaction(async (tx) => {
			const customer = await tx.query.customer.findFirst({
				where: eq(customerTable.braintreeCustomerId, user.customer!),
				with: {
					billingAddress: true
				}
			});

			if (customer === undefined) {
				error(400, {
					message: 'You must already be a customer'
				});
			}

			return customer.billingAddress;
		});
	}
};
