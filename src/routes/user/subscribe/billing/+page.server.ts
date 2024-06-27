import AddressFormatter from '@shopify/address';
import type { PageServerLoad } from './$types';
import { createLoginRedirectURL } from '$lib/utils';
import { redirect } from '@sveltejs/kit';
import { db } from '$lib/models/db';
import { user } from '$lib/models/schema';
import { eq } from 'drizzle-orm';
import { tierToQueryParameters, zTier } from '$lib/tier';

export const load: PageServerLoad = async ({ locals, url }) => {
	if (locals.user === null) {
		redirect(302, createLoginRedirectURL(url));
	}
	if (!locals.user.isEmailVerified) {
		redirect(302, createLoginRedirectURL(url, '/user/email-verification'));
	}

	const tier = {
		maxConcurrentViewers: Number(url.searchParams.get('maxConcurrentViewers')),
		maxConcurrentStreams: Number(url.searchParams.get('maxConcurrentStreams')),
		maxBitrateInKbps: Number(url.searchParams.get('maxBitrateInKbps'))
	};
	const zodResult = zTier.safeParse(tier);

	if (locals.user.customer !== null) {
		const userWithCustomer = await db.query.user.findFirst({
			where: eq(user.id, locals.user.id),
			with: {
				customer: true
			}
		});

		if (
			userWithCustomer?.customer?.subscription !== null &&
			userWithCustomer?.customer?.subscription !== undefined
		) {
			redirect(302, '/user/billing');
		} else {
			if (!zodResult.success) {
				redirect(302, '/user/subscribe/byo');
			}

			redirect(302, `/user/subscribe/payment?${tierToQueryParameters(zodResult.data)}`);
		}
	}

	const addressFormatter = new AddressFormatter('en');
	const countries = addressFormatter.getCountries();

	if (!zodResult.success) {
		redirect(302, '/user/subscribe/byo');
	}

	return {
		tier: zodResult.data,
		countries: await countries
	};
};
