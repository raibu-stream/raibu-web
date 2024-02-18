import { z } from "zod";
import { test as commonPasswordTest } from 'fxa-common-password-list';

export const EMAIL_VERIFICATION_VERIFY_TIMEOUT_DISCRIMINATOR = 'emailverifyverify'

export const handleApiResponse = async (res: Response, onSuccess?: () => void) => {
	if (res.statusText === 'OK') {
		if (onSuccess) onSuccess();
	} else {
		let data;
		try {
			data = await res.json();
		} catch {
			console.error(res);
			return 'An unknown error occurred';
		}

		if (data.message !== undefined) {
			return data.message;
		} else {
			console.warn(res);
			console.warn(data);
			return 'An unknown error occurred';
		}
	}
};

const emailRegex = /^[\S\s]+@[\S\s]+$/;

export const loginEmail = z.string().trim().toLowerCase().min(1, "Email is required");
export const loginPassword = z.string().min(1, "Password is required");

export const password = loginPassword
	.min(8, "Must be at least 8 characters long.")
	.max(255, "Must be below 255 characters.")
	.refine((pass) => !commonPasswordTest(pass), {
		message: "Password is too common"
	});
export const email = loginEmail
	.max(255, "Must be below 255 characters.")
	.regex(emailRegex, "Must be a valid email");

export const createLoginRedirectURL = (url: URL, to: string = '/?login=true') => {
	const path = encodeURIComponent(url.pathname + url.search);
	return `${to}${to.includes('?') ? '&' : '?'}redirect-to=${path}`;
};