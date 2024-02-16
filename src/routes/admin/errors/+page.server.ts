import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { db } from '$lib/models/db';
import { count, ilike, or } from 'drizzle-orm';
import { errorLog } from '$lib/models/schema';

export const load: PageServerLoad = async ({ locals, url }) => {
	const session = await locals.auth.validate();
	if (!session || !session.user.isAdmin) {
		error(401, 'You are not an admin');
	}

	const pageIndex = Number(url.searchParams.get('page')) || 0;
	const searchString = url.searchParams.get('search');
	if (isNaN(Number(url.searchParams.get('page'))) || 0 > pageIndex) {
		redirect(302, '/admin/errors');
	}

	const searchCondition =
		searchString !== null
			? or(ilike(errorLog.errorId, `%${searchString}%`), ilike(errorLog.error, `%${searchString}%`))
			: undefined;

	// TODO: count() is slow :(
	const errorsCount = await db
		.select({ value: count() })
		.from(errorLog)
		.where(searchCondition)
		.then((count) => count[0].value);
	const errors = await db.query.errorLog.findMany({
		offset: pageIndex * 15,
		limit: 15,
		orderBy: (error, { desc }) => desc(error.errorId),
		where: searchCondition
	});

	if (errors.length === 0 && pageIndex !== 0 && searchString === null) {
		redirect(302, `/admin/errors${errorsCount !== 0 ? `?search=${searchString}` : ''}`);
	}

	return {
		errors: errors,
		totalErrors: errorsCount
	};
};
