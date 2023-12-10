import { error } from "@sveltejs/kit";
import { auth } from "$lib/auth";
import { LuciaError } from "lucia";
import { dev } from '$app/environment';

const emailRegex = /[^@\s]+@[^@\s]+/;

export const POST = async ({ request, locals }) => {
	if (!dev) {
		throw error(400, "We are currently not accepting registrations. Come back later")
	}

	const formData = await request.json()
	const email = formData.email;
	const password = formData.password;

	if (typeof email !== "string" ||
		email === '' ||
		!emailRegex.test(email) ||
		email.length > 255) {
		throw error(400, {
			message: "Invalid email"
		});
	}
	if (typeof password !== "string" ||
		password.length < 8 ||
		password.length > 255) {
		throw error(400, {
			message: "Invalid password"
		});
	}

	try {
		const user = await auth.createUser({
			key: {
				providerId: "email",
				providerUserId: email.toLowerCase(),
				password
			},
			attributes: {
				email
			}
		});

		const session = await auth.createSession({
			userId: user.userId,
			attributes: {}
		});
		locals.auth.setSession(session);
	} catch (e) {
		if (e instanceof LuciaError && e.message === 'AUTH_DUPLICATE_KEY_ID') {
			throw error(400, {
				message: "This email is already being used"
			});
		}
		throw error(500, {
			message: "An unknown error occurred"
		});
	}

	return new Response(JSON.stringify(undefined), {
		status: 200
	});
}