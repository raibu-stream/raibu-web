import { siteConfig } from '$lib/models/schema';
import { eq } from 'drizzle-orm';
import type { PageServerLoad } from './$types';
import { db } from '$lib/models/db';
import { disableSignupId } from '$lib/utils';

export const load: PageServerLoad = async () => {
    return {
        signupDisabledMessage: (await db.query.siteConfig.findFirst({ where: eq(siteConfig.id, disableSignupId) }))?.value ?? undefined
    };
};
