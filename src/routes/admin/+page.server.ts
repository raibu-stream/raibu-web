import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { db } from '$lib/models/db';

export const load: PageServerLoad = async ({ locals }) => {
	if (locals.user === null || !locals.user?.isAdmin) {
		error(401, 'You are not an admin');
	}

	return {
		configs: db.query.siteConfig.findMany()
	};
};
