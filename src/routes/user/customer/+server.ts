import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { fromZodError } from 'zod-validation-error';
import AddressFormatter from '@shopify/address';
import { address as zAddress } from '$lib/utils';
import type { User } from 'lucia';
import { db } from '$lib/models/db';
import { customer as customerTable, user as userTable } from '$lib/models/schema';
import { eq } from 'drizzle-orm';
import type { z } from 'zod';
import { stripeClient } from '$lib/stripe';
import { deleteCustomerOnUser } from '$lib/models/user';

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
			where: eq(customerTable.stripeCustomerId, locals.user!.customer!)
		});
		if (customer?.subscription !== null) {
			error(400, {
				message: 'You are already subscribed'
			});
		}

		await deleteCustomerOnUser({ ...locals.user, customer: locals.user.customer! });
	}

	const addressFormatter = new AddressFormatter('en');
	const zodResult = zAddress(await addressFormatter.getCountries()).safeParse(await request.json());
	if (!zodResult.success) {
		error(400, fromZodError(zodResult.error).toString());
	}
	const address = zodResult.data;

	await createCustomer(address, locals.user, getClientAddress);

	return new Response(JSON.stringify(undefined), {
		status: 200
	});
};

const createCustomer = async (
	address: z.infer<ReturnType<typeof zAddress>>,
	user: User,
	getClientAddress: () => string
) => {
	const customer = await stripeClient.customers.create({
		name: address.name,
		address: {
			line1: address.address1,
			line2: address.address2,
			country: address.country,
			city: address.city,
			postal_code: address.postalCode,
			state: address.zone
		},
		email: user.id,
		tax: {
			ip_address: getClientAddress()
		}
	});

	await db.transaction(async (tx) => {
		await tx.insert(customerTable).values({
			stripeCustomerId: customer.id
		});
		await tx
			.update(userTable)
			.set({
				customer: customer.id
			})
			.where(eq(userTable.id, user.id));
	});

	return customer;
};
