export const load = async ({ locals, url }) => {
	const login = url.searchParams.get('login');
	const resetPasswordToken = url.searchParams.get('password-reset');
	const session = await locals.auth.validate();
	return {
		loggedIn: !!session,
		resetPasswordToken: resetPasswordToken,
		loginModal: login,
		email: session?.user.email
	};
};
