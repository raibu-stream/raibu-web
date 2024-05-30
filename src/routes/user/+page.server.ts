import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { createLoginRedirectURL } from '$lib/utils';
import { db } from '$lib/models/db';
import { eq } from 'drizzle-orm';
import { customer } from '$lib/models/schema';
import type { Tier } from '$lib/tier';

export const load: PageServerLoad = async ({ locals, url }) => {
	if (locals.user === null) {
		redirect(302, createLoginRedirectURL(url));
	}
	if (!locals.user.isEmailVerified) {
		redirect(302, createLoginRedirectURL(url, '/user/email-verification'));
	}

	let tier = undefined;
	if (locals.user.customer !== null) {
		tier = (await db.query.customer.findFirst({
			where: eq(customer.braintreeCustomerId, locals.user.customer),
			with: {
				subscription: true
			}
		}))?.subscription as Tier
	}

	return {
		email: locals.user.id,
		tier
	};
};
