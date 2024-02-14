import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { db } from '$lib/models/db';
import { and, desc, eq, ilike, not, or } from 'drizzle-orm';
import { requestLog } from '$lib/models/schema';

export const load: PageServerLoad = async ({ locals }) => {
	const session = await locals.auth.validate();
	if (!session || !session.user.isAdmin) {
		throw error(401, 'You are not an admin');
	}

	const logsForUniqueRoutes = new Map(
		Array.from(uniqueRoutes.entries()).map((route) => {
			const table = db.query.requestLog.findMany({
				where: and(
					eq(requestLog.routeId, route[1].routeId),
					eq(requestLog.requestMethod, route[1].method)
				),
				orderBy: desc(requestLog.requestDate)
			});
			return [route[0], table];
		})
	);
	const pageRouteCondition = Array.from(uniqueRoutes.entries()).map((route) => {
		return and(
			eq(requestLog.routeId, route[1].routeId),
			eq(requestLog.requestMethod, route[1].method)
		);
	});

	const logsForPageRoutes = db.query.requestLog.findMany({
		where: not(or(...pageRouteCondition, ilike(requestLog.routeId, '/admin%'))!),
		orderBy: desc(requestLog.requestDate)
	});

	return {
		logs: {
			uniqueRoutes: logsForUniqueRoutes,
			pageRoutes: logsForPageRoutes
		}
	};
};

const uniqueRoutes = new Map([
	['Create User', { routeId: '/user', method: 'POST' }],
	['Create Email Verification Code', { routeId: '/user/email-verification/code', method: 'POST' }],
	[
		'Verify Email Verification Code',
		{ routeId: '/user/email-verification/verify', method: 'POST' }
	],
	['Reset Password', { routeId: '/user/reset-password/reset', method: 'POST' }],
	['Create Reset Password Token', { routeId: '/user/reset-password/token', method: 'POST' }],
	['Login', { routeId: '/user/session', method: 'POST' }],
	['Sign out', { routeId: '/user/session', method: 'DELETE' }],
	['Verify Too Many Logins Token', { routeId: '/user/too-many-logins/[token]', method: 'GET' }]
]);
