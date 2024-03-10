<script lang="ts">
	import { createSlider, melt } from '@melt-ui/svelte';

	let tickValues: (string | number)[];
	let classNames = '';
	export { classNames as class, tickValues as ticks };
	export let value = tickValues[0];

	const {
		elements: { root, range, thumbs, ticks },
		states: { value: valueRaw }
	} = createSlider({
		defaultValue: [0],
		min: 0,
		max: tickValues.length - 1,
		step: 1
	});

	$: value = tickValues[$valueRaw[0]];
</script>

<span use:melt={$root} class="relative flex h-5 items-center {classNames}">
	<span class="h-1 w-full rounded bg-neutral-900/40">
		<span use:melt={$range} class="h-1 rounded bg-secondary-700" />
	</span>

	{#each $ticks as tick, i}
		<div use:melt={tick} class="flex flex-col items-center justify-start gap-1 pt-5">
			<div class="mt-2 h-3 w-0.5 rounded-full rounded-t-none bg-neutral-200/50"></div>
			<span class="text-xs">{tickValues[i]}</span>
		</div>
	{/each}

	<span
		use:melt={$thumbs[0]}
		class="h-5 w-5 rounded-full bg-primary-200 outline-none focus:ring-4 focus:!ring-neutral-300"
	/>
</span>
