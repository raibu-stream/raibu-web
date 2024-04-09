import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { createLoginRedirectURL } from '$lib/utils';
import { db } from '$lib/models/db';
import { eq } from 'drizzle-orm';
import { tier } from '$lib/models/schema';

export const load: PageServerLoad = async ({ locals, url }) => {
	if (locals.user === null) {
		redirect(302, createLoginRedirectURL(url));
	}
	if (!locals.user.isEmailVerified) {
		redirect(302, createLoginRedirectURL(url, '/user/email-verification'));
	}

	return {
		email: locals.user.id,
		tier: await db.query.tier.findFirst({
			where: locals.user.tier !== null ? eq(tier.id, locals.user.tier) : undefined
		})
	};
};
