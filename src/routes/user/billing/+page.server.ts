import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { createLoginRedirectURL } from '$lib/utils';
import { braintreeGateway } from '$lib/braintree';
import { db } from '$lib/models/db';
import {
	user,
	customer as customerTable,
	subscription as subscriptionTable
} from '$lib/models/schema';
import { eq } from 'drizzle-orm';
import type { Tier } from '$lib/tier';
import { CreditCard, PayPalAccount } from 'braintree';

export const load: PageServerLoad = async ({ locals, url }) => {
	if (locals.user === null) {
		redirect(302, createLoginRedirectURL(url));
	}
	if (!locals.user.isEmailVerified) {
		redirect(302, createLoginRedirectURL(url, '/user/email-verification'));
	}
	if (locals.user.customer === null) {
		redirect(302, '/user/subscribe');
	}

	let customer;
	try {
		customer = await braintreeGateway.customer.find(locals.user.customer);
	} catch (err) {
		if ((err as any).type === 'notFoundError') {
			await db
				.update(user)
				.set({
					customer: null
				})
				.where(eq(user.id, locals.user.id));

			redirect(302, '/user/subscribe');
		} else {
			throw err;
		}
	}

	const tier = (async () => {
		const customer = await db.query.customer.findFirst({
			where: eq(customerTable.braintreeCustomerId, locals.user!.customer!),
			with: {
				subscription: true
			}
		});

		if (customer === undefined) {
			await braintreeGateway.customer.delete(locals.user!.customer!);
			await db
				.update(user)
				.set({
					customer: null
				})
				.where(eq(user.id, locals.user!.id!));

			redirect(302, '/user/subscribe');
		}
		if (customer.subscription === null) {
			return undefined;
		}

		let subscription;
		try {
			subscription = await braintreeGateway.subscription.find(customer.subscription.id);
		} catch (err) {
			if ((err as any).type === 'notFoundError') {
				await db
					.update(customerTable)
					.set({
						subscription: null
					})
					.where(eq(customerTable.braintreeCustomerId, customer.braintreeCustomerId));
				await db
					.delete(subscriptionTable)
					.where(eq(subscriptionTable.id, customer.subscription.id));

				return undefined;
			} else {
				throw err;
			}
		}

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
	})();

	const transactionStream = braintreeGateway.transaction.search((search) => {
		search.customerId().is(locals.user!.customer!);
	});

	return {
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
		subscription: tier
	};
};
