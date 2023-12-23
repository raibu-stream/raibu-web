import { redirect } from '@sveltejs/kit';

export const load = async ({ locals, url }) => {
	const session = await locals.auth.validate();

	if (!session) {
		throw redirect(302, '/?login=true');
	}
	if (session.user.isEmailVerified) {
		throw redirect(302, '/user');
	}

	const isPreSent = url.searchParams.get('pre-sent') === 'true';

	return {
		email: session.user.email,
		isPreSent: isPreSent
	};
};