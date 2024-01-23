import { error, redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = async () => {
    throw error(500, {
        message: "penis too large",
        errorId: "5b2416d6-6a74-45da-953b-eb1bd51f71e5"
    })
};
