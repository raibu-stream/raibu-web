<script lang="ts">
	import { createSwitch, melt } from '@melt-ui/svelte';

	export let required: boolean | undefined = false;
	export let defaultChecked: boolean = false;
	let classNames = '';

	const {
		elements: { root, input },
		states: { checked }
	} = createSwitch({
		required,
		defaultChecked
	});

	export { checked, classNames as class };
</script>

<button
	use:melt={$root}
	class="group relative h-6 w-11 rounded-full bg-neutral-800 p-1 transition-colors data-[state=checked]:bg-neutral-900 {classNames}"
>
	<span
		class="block h-full w-4 rounded-full bg-primary-200 transition group-data-[state=checked]:translate-x-5"
	/>
</button>
<input use:melt={$input} />
