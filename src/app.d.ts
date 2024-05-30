import { default as paypalGlobal } from 'paypal-checkout-components';

/// <reference types="lucia" />
declare global {
	namespace App {
		interface Locals {
			user: import('lucia').User | null;
			session: import('lucia').Session | null;
		}

		interface Error {
			message: string;
			errorId?: string;
		}
	}

	const paypal: typeof paypalGlobal;
}

export { };
