import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { createLoginRedirectURL } from '$lib/utils';

export const load: PageServerLoad = async ({ locals, url }) => {
	if (locals.user === null) {
		redirect(302, createLoginRedirectURL(url));
	}
	if (locals.user.isEmailVerified) {
		redirect(302, '/user');
	}

	const redirectTo = url.searchParams.get('redirect-to');
	const isPreSent = url.searchParams.get('pre-sent') === 'true';

	return {
		email: locals.user.id,
		isPreSent: isPreSent,
		redirectTo
	};
};
