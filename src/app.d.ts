/// <reference types="lucia" />
declare global {
	namespace Lucia {
		type Auth = import('$lib/models/db').Auth;
		type DatabaseUserAttributes = {
			email: string;
			isEmailVerified: boolean;
			isLocked: boolean;
		};
		// eslint-disable-next-line @typescript-eslint/ban-types
		type DatabaseSessionAttributes = {};
	}
	namespace App {
		interface Locals {
			auth: import('lucia').AuthRequest;
		}
	}
}

export {};
