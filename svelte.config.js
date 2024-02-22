import { preprocessMeltUI, sequence } from '@melt-ui/pp';
import adapter from '@sveltejs/adapter-node';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
/** @type {import('@sveltejs/kit').Config}*/
const config = {
	kit: {
		adapter: adapter()
	},
	preprocess: sequence([vitePreprocess({}), preprocessMeltUI()])
};
export default config;
