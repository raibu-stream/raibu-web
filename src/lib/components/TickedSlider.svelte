<script lang="ts">
	import { createSlider, melt } from '@melt-ui/svelte';
	import { writable, type Writable } from 'svelte/store';

	let tickValues: (string | number)[];
	let classNames = '';
	export { classNames as class, tickValues as ticks };
	export let value: Writable<number[]>;

	const {
		elements: { root, range, thumbs, ticks }
	} = createSlider({
		value,
		min: 0,
		max: tickValues.length - 1,
		step: 1
	});
</script>

<span use:melt={$root} class="relative flex h-5 items-center {classNames}">
	<span class="h-1 w-full rounded bg-neutral-900/40">
		<span use:melt={$range} class="h-1 rounded bg-secondary-700" />
	</span>

	{#each $ticks as tick, i}
		<div use:melt={tick} class="relative flex flex-col items-center justify-start gap-1 pt-2">
			<div
				class="h-3 w-0.5 rounded-full bg-neutral-300/10"
				class:rounded-tl-none={i !== 0}
				class:rounded-tr-none={i !== $ticks.length - 1}
			></div>
			<span class="absolute -bottom-4 text-xs">{tickValues[i]}</span>
		</div>
	{/each}

	<span
		use:melt={$thumbs[0]}
		class="h-5 w-5 rounded-full bg-primary-200 outline-none !ring-primary-200/25 focus:ring-4"
	/>
</span>
