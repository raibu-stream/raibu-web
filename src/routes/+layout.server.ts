import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals, url }) => {
	const login = url.searchParams.get('login');
	const resetPasswordToken = url.searchParams.get('password-reset');
	const redirectTo = url.searchParams.get('redirect-to');

	return {
		loggedIn: locals.user !== null,
		resetPasswordToken: resetPasswordToken,
		loginModal: login,
		redirectTo,
		email: locals.user?.id
	};
};
