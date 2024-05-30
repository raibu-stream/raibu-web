import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import compileTime from "vite-plugin-compile-time"

export default defineConfig({
	plugins: [sveltekit(), compileTime()]
});
