import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { createLoginRedirectURL } from '$lib/utils';

export const load: PageServerLoad = async ({ locals, url }) => {
	const session = await locals.auth.validate();
	if (!session) {
		redirect(302, createLoginRedirectURL(url));
	}
	if (!session.user.isEmailVerified) {
		redirect(302, createLoginRedirectURL(url, '/user/email-verification'));
	}

	return {
		email: session.user.email
	};
};
