import { writable } from 'svelte/store';

export const dropdown = writable<
	| {
			from: HTMLElement;
			offset?: { top?: number; left?: number };
			id: string;
			component: any;
			props?: Record<string, unknown>;
	  }
	| undefined
>();
export const modal = writable<
	| { component: any; props?: Record<string, unknown>; title: string; maxWidthPx?: number }
	| undefined
>();
