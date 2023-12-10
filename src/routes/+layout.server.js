export const load = async ({ locals, url }) => {
    const login = url.searchParams.get('login');
    const session = await locals.auth.validate()
    return {
        loggedIn: !!session,
        loginModal: login,
        email: session?.user.email
    };
};