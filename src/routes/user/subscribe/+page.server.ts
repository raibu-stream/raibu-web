import AddressFormatter from '@shopify/address';
import type { PageServerLoad } from './$types';
import { createLoginRedirectURL } from '$lib/utils';
import { redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ locals, url, getClientAddress }) => {
	if (locals.user === null) {
		redirect(302, createLoginRedirectURL(url));
	}
	if (!locals.user.isEmailVerified) {
		redirect(302, createLoginRedirectURL(url, '/user/email-verification'));
	}

	const addressFormatter = new AddressFormatter('en');
	return {
		countries: await addressFormatter.getCountries(),
		signupDate: locals.user.signupDate,
		ip: getClientAddress()
	};
};
