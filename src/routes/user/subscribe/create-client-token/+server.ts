import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { BraintreeGateway } from '$lib/braintree';

export const POST: RequestHandler = async ({ locals }) => {
    if (locals.user === null) {
        error(401, {
            message: 'You are not logged in'
        });
    }
    if (!locals.user.isEmailVerified) {
        error(401, {
            message: "Your email's not verified"
        });
    }

    const res = await BraintreeGateway.clientToken.generate({});

    if (typeof res.clientToken !== 'string' || !res.success) {
        error(500, {
            message: 'Call to Braintree to generate client token failed'
        });
    }

    return new Response(JSON.stringify(res.clientToken), {
        status: 200,
    });
};
