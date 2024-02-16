import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { createLoginRedirectURL } from '$lib/utils';

export const load: PageServerLoad = async ({ locals, url }) => {
	const redirectTo = url.searchParams.get('redirect-to');

	const session = await locals.auth.validate();

	if (!session) {
		redirect(302, createLoginRedirectURL(url));
	}
	if (session.user.isEmailVerified) {
		redirect(302, '/user');
	}

	const isPreSent = url.searchParams.get('pre-sent') === 'true';

	return {
		email: session.user.email,
		isPreSent: isPreSent,
		redirectTo
	};
};
