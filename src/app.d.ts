/// <reference types="lucia" />
declare global {
	namespace Lucia {
		type Auth = import('$lib/models/db').Auth;
		type DatabaseUserAttributes = {
			email: string;
			is_email_verified: boolean;
			is_locked: boolean;
			is_admin: boolean;
		};
		// eslint-disable-next-line @typescript-eslint/ban-types
		type DatabaseSessionAttributes = {};
	}
	namespace App {
		interface Locals {
			auth: import('lucia').AuthRequest;
		}
		interface Error {
			message: string;
			errorId?: string;
		}
	}
}

export {};
