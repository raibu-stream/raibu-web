import { writable } from 'svelte/store';

export const modal = writable<
	| { component: any; props?: Record<string, unknown>; title: string; maxWidthPx?: number }
	| undefined
>();
