import type { PageServerLoad } from './$types';
import { createLoginRedirectURL } from '$lib/utils';
import { redirect } from '@sveltejs/kit';
import { db } from '$lib/models/db';
import { user } from '$lib/models/schema';
import { eq } from 'drizzle-orm';

export const load: PageServerLoad = async ({ locals, url }) => {
	if (locals.user === null) {
		redirect(302, createLoginRedirectURL(url));
	}
	if (!locals.user.isEmailVerified) {
		redirect(302, createLoginRedirectURL(url, '/user/email-verification'));
	}

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
		}
	}
};
