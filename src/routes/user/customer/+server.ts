import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { fromZodError } from 'zod-validation-error';
import AddressFormatter from '@shopify/address';
import { address as zAddress } from '$lib/utils';
import { braintreeGateway } from '$lib/braintree';
import type { User } from 'lucia';
import { db } from '$lib/models/db';
import {
	customer as customerTable,
	user as userTable,
	billingAddress as addressTable
} from '$lib/models/schema';
import { eq } from 'drizzle-orm';
import type { z } from 'zod';

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
		const customer = await db.query.customer.findFirst({
			where: eq(customerTable.braintreeCustomerId, locals.user!.customer!)
		});
		if (customer?.subscription !== null) {
			error(400, {
				message: 'You are already subscribed'
			});
		}

		try {
			await braintreeGateway.customer.delete(locals.user!.customer!);
		} finally {
			await db.update(userTable).set({
				customer: null
			}).where(eq(userTable.id, locals.user!.id));
			await db
				.delete(customerTable)
				.where(eq(customerTable.braintreeCustomerId, locals.user!.customer!));
		}
	}

	const addressFormatter = new AddressFormatter('en');
	const zodResult = zAddress(await addressFormatter.getCountries()).safeParse(await request.json());
	if (!zodResult.success) {
		error(400, fromZodError(zodResult.error).toString());
	}
	const address = zodResult.data;

	await createCustomer(request, address, locals.user, getClientAddress);

	return new Response(JSON.stringify(undefined), {
		status: 200
	});
};

const createCustomer = async (
	request: Request,
	address: z.infer<ReturnType<typeof zAddress>>,
	user: User,
	getClientAddress: () => string
) => {
	const userAgent = request.headers.get('user-agent');

	const createCustomerResult = await braintreeGateway.customer.create({
		firstName: address.firstName,
		lastName: address.lastName,
		company: address.company,
		email: user.id,
		riskData: {
			customerIp: getClientAddress(),
			customerBrowser:
				userAgent !== null ? (userAgent.length <= 255 ? userAgent : undefined) : undefined
		}
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

	await db.transaction(async (tx) => {
		const billingAddress = (await tx.insert(addressTable).values(address).returning())[0];
		await tx.insert(customerTable).values({
			braintreeCustomerId: createCustomerResult.customer.id,
			billingAddress: billingAddress.id
		});
		await tx.update(userTable).set({
			customer: createCustomerResult.customer.id
		}).where(eq(userTable.id, user.id));
	});

	return createCustomerResult.customer;
};
