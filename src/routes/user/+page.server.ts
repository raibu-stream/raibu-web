import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const session = await locals.auth.validate();
	if (!session) {
		throw redirect(302, '/?login=true');
	}
	if (!session.user.isEmailVerified) {
		throw redirect(302, '/user/email-verification');
	}

	return {
		email: session.user.email
	};
};
