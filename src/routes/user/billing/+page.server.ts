import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { createLoginRedirectURL } from '$lib/utils';
import { braintreeGateway } from '$lib/braintree';
import { db } from '$lib/models/db';
import {
	customer as customerTable,
} from '$lib/models/schema';
import { eq } from 'drizzle-orm';
import type { Tier } from '$lib/tier';
import { CreditCard, PayPalAccount } from 'braintree';

export const load: PageServerLoad = async ({ locals, url, getClientAddress }) => {
	if (locals.user === null) {
		redirect(302, createLoginRedirectURL(url));
	}
	if (!locals.user.isEmailVerified) {
		redirect(302, createLoginRedirectURL(url, '/user/email-verification'));
	}
	if (locals.user.customer === null) {
		redirect(302, '/user/subscribe');
	}

	const customer = await braintreeGateway.customer.find(locals.user.customer);

	const address = (await db.query.customer.findFirst({
		where: eq(customerTable.braintreeCustomerId, locals.user.customer),
		with: {
			billingAddress: true
		}
	}))!.billingAddress;

	const tier = getTier(locals);

	const transactionStream = braintreeGateway.transaction.search((search) => {
		search.customerId().is(locals.user!.customer!);
	});

	return {
		email: locals.user.id,
		transactions: transactionStream.reduce<
			{
				id: string;
				date: string;
				amount: string;
				for?: {
					billingPeriodEndDate: Date;
					billingPeriodStartDate: Date;
				};
				status: braintree.TransactionStatus;
			}[]
		>((transactions, transaction: braintree.Transaction) => {
			transactions.push({
				id: transaction.id,
				date: transaction.createdAt,
				amount: transaction.amount,
				for:
					transaction.subscription !== undefined
						? {
							billingPeriodEndDate: transaction.subscription.billingPeriodEndDate,
							billingPeriodStartDate: transaction.subscription.billingPeriodStartDate
						}
						: undefined,
				status: transaction.status
			});

			return transactions;
		}, []),
		paymentMethods: [
			...(customer.paypalAccounts !== undefined
				? customer.paypalAccounts.map((account) => {
					return {
						token: account.token,
						maskedEmail: account.email.replace(
							/^(.)(.*)(.@.*)$/,
							(_, a, b, c) => a + b.replace(/./g, '*') + c
						)
					};
				})
				: []),
			...(customer.creditCards !== undefined
				? customer.creditCards.map((card) => {
					return {
						token: card.token,
						maskedNumber: card.maskedNumber,
						expiration: card.expirationDate
					};
				})
				: [])
		],
		subscription: tier,
		signupDate: locals.user.signupDate,
		ip: getClientAddress(),
		address: {
			address2: address.address2 ?? undefined,
			zone: address.zone ?? undefined,
			city: address.city ?? undefined,
			postalCode: address.postalCode ?? undefined,
			firstName: address.firstName,
			lastName: address.lastName,
			address1: address.address1,
			country: address.country
		}
	};
};

const getTier = async (locals: App.Locals) => {
	const customer = await db.query.customer.findFirst({
		where: eq(customerTable.braintreeCustomerId, locals.user!.customer!),
		with: {
			subscription: true
		}
	});

	if (customer === undefined) {
		redirect(302, '/user/subscribe');
	}
	if (customer.subscription === null) {
		return undefined;
	}

	const subscription = await braintreeGateway.subscription.find(customer.subscription.id);

	const paymentMethod = await braintreeGateway.paymentMethod.find(
		subscription.paymentMethodToken
	);

	return {
		token: subscription.id,
		status: subscription.status,
		paymentMethod: (paymentMethod instanceof PayPalAccount
			? {
				token: paymentMethod.token,
				maskedEmail: paymentMethod.email.replace(
					/^(.)(.*)(.@.*)$/,
					(_, a, b, c) => a + b.replace(/./g, '*') + c
				)
			}
			: paymentMethod instanceof CreditCard
				? {
					token: paymentMethod.token,
					maskedNumber: paymentMethod.maskedNumber,
					expiration: paymentMethod.expirationDate
				}
				: undefined)!,
		balance: subscription.balance,
		nextBillAmount: subscription.nextBillAmount,
		nextBillingDate: subscription.nextBillingDate,
		tier: customer.subscription as Tier
	};
}