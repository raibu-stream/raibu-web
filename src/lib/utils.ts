import { z } from 'zod';
import { test as commonPasswordTest } from 'fxa-common-password-list';
import { createLabel } from '@melt-ui/svelte';
import type { Country } from '@shopify/address';

export const EMAIL_VERIFICATION_VERIFY_TIMEOUT_DISCRIMINATOR = 'emailverifyverify';
export const FRIENDLY_ERROR_MESSAGE =
	'Oops. Something went wrong on our side. Our amazing and very beautiful engineers have been notified. But in the meantime, go ahead and try again.';

export const handleApiResponse = async (
	res: Response,
	onSuccess?: (res: Response) => void
): Promise<string | undefined> => {
	if (res.statusText === 'OK') {
		if (onSuccess) onSuccess(res);
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

export const loginEmail = z
	.string()
	.trim()
	.toLowerCase()
	.min(1, 'Email is required')
	.max(255, 'Must be below 255 characters.');
export const loginPassword = z
	.string()
	.min(1, 'Password is required')
	.max(255, 'Must be below 255 characters.');

export const password = loginPassword
	.min(8, 'Must be at least 8 characters long.')
	.refine((pass) => !commonPasswordTest(pass), {
		message: 'Password is too common'
	});
export const email = loginEmail.regex(emailRegex, 'Must be a valid email');
export const address = (countries: Country[]) => {
	const validCountryCodes = countries.map((country) => country.code);

	return z
		.object({
			name: z.string().min(1, 'This is required').max(5000, 'Cannot be more than 5000 characters'),
			country: z
				.string()
				.length(2)
				.refine((country) => validCountryCodes.includes(country), 'Not a valid country'),
			address1: z
				.string()
				.min(1, 'This is required')
				.max(5000, 'Cannot be more than 5000 characters'),
			address2: z
				.string()
				.min(1, 'This is required')
				.max(5000, 'Cannot be more than 5000 characters')
				.optional(),
			city: z
				.string()
				.min(1, 'This is required')
				.max(5000, 'Cannot be more than 5000 characters')
				.optional(),
			zone: z
				.string()
				.min(1, 'This is required')
				.max(5000, 'Cannot be more than 5000 characters')
				.optional(),
			postalCode: z
				.string()
				.trim()
				.min(1, 'This is required')
				.min(4, 'Must be at least 4 characters')
				.max(10, 'Cannot be more than 10 characters')
				.optional()
		})
		.superRefine((address, ctx) => {
			const country = countries.find((country) => country.code === address.country)!;

			if (
				(address.city === undefined && country.formatting.edit.includes('{city}')) ||
				(address.city !== undefined && !country.formatting.edit.includes('{city}'))
			)
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message:
						address.city === undefined
							? 'This is required'
							: `City can't be defined because ${country.name} doesn't use it for addressing`,
					path: ['city']
				});
			if (
				(address.zone === undefined && country.formatting.edit.includes('{province}')) ||
				(address.zone !== undefined && !country.formatting.edit.includes('{province}'))
			)
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message:
						address.zone === undefined
							? 'This is required'
							: `Zone can't be defined because ${country.name} doesn't use it for addressing`,
					path: ['zone']
				});
			if (
				(address.postalCode === undefined && country.formatting.edit.includes('{zip}')) ||
				(address.postalCode !== undefined && !country.formatting.edit.includes('{zip}'))
			)
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message:
						address.postalCode === undefined
							? 'This is required'
							: `PostalCode can't be defined because ${country.name} doesn't use it for addressing`,
					path: ['postalCode']
				});
		});
};

export function assert(condition: boolean, errorMessage?: string): asserts condition {
	if (!condition) {
		throw new Error(errorMessage);
	}
}

export const createLoginRedirectURL = (url: URL, to: string = '/?login=true') => {
	const path = encodeURIComponent(url.pathname + url.search);
	return `${to}${to.includes('?') ? '&' : '?'}redirect-to=${path}`;
};

const {
	elements: { root }
} = createLabel();
export const meltLabel = root;

export const topAlertId = 'topAlert';
export const disableSignupId = 'disableSignup';
