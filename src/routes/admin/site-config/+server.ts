import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/models/db';
import { siteConfig } from '$lib/models/schema';
import { z } from 'zod';
import { fromZodError } from 'zod-validation-error';

const putInputSchema = z.object({
	id: z.string().trim().min(1).max(255),
	update: z.string().min(1).or(z.null())
});

export const PUT: RequestHandler = async ({ locals, request }) => {
	if (locals.user === null || !locals.user?.isAdmin) {
		error(401, 'You are not an admin');
	}

	const zodResult = putInputSchema.safeParse(await request.json());
	if (!zodResult.success) {
		error(400, fromZodError(zodResult.error).toString());
	}
	const { id, update } = zodResult.data;

	await db
		.insert(siteConfig)
		.values({
			id,
			value: update
		})
		.onConflictDoUpdate({
			set: { value: update },
			target: siteConfig.id
		});

	return new Response(JSON.stringify(undefined), {
		status: 200
	});
};
