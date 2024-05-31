import { db } from '$lib/models/db';
import { eq } from 'drizzle-orm';
import type { LayoutServerLoad } from './$types';
import { siteConfig } from '$lib/models/schema';
import { topAlertId } from '$lib/utils';

export const load: LayoutServerLoad = async ({ locals, url }) => {
	const login = url.searchParams.get('login');
	const resetPasswordToken = url.searchParams.get('password-reset');
	const redirectTo = url.searchParams.get('redirect-to');

	return {
		loggedIn: locals.user !== null,
		resetPasswordToken: resetPasswordToken,
		loginModal: login,
		redirectTo,
		email: locals.user?.id,
		isAdmin: locals.user?.isAdmin ?? false,
		topAlert:
			(await db.query.siteConfig.findFirst({ where: eq(siteConfig.id, topAlertId) }))?.value ??
			undefined
	};
};
