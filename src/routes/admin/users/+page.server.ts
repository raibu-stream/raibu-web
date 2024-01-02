import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { db } from '$lib/models/db';
import { count, ilike, or } from 'drizzle-orm';
import { user } from '$lib/models/schema';

export const load: PageServerLoad = async ({ locals, url }) => {
	const session = await locals.auth.validate();
	if (!session || !session.user.isAdmin) {
		throw error(401, 'You are not an admin');
	}

	const pageIndex = Number(url.searchParams.get('page')) || 0;
	const searchString = url.searchParams.get('search');
	if (isNaN(Number(url.searchParams.get('page'))) || 0 > pageIndex) {
		throw redirect(302, '/admin/users');
	}

	const searchCondition = searchString !== null ? or(ilike(user.email, `%${searchString}%`), ilike(user.id, `%${searchString}%`)) : undefined;

	// TODO: count() is slow :(
	const usersCount = await db
		.select({ value: count() })
		.from(user)
		.where(searchCondition)
		.then((count) => count[0].value);
	const users = await db.query.user.findMany({
		offset: pageIndex * 15,
		limit: 15,
		orderBy: (user, { desc }) => desc(user.id),
		where: searchCondition
	});

	if (users.length === 0 && pageIndex !== 0 && searchString === null) {
		throw redirect(302, `/admin/users${searchString !== null && usersCount !== 0 ? `?search=${searchString}` : ''}`);
	}

	return {
		users: users,
		totalUsers: usersCount
	};
};