<script lang="ts">
	import { quintOut } from 'svelte/easing';
	import { slide } from 'svelte/transition';

	let streams: { id: number }[] = [{ id: 0 }];
	let maxStreams = 4;

	let isHoveringStreamCreator = false;
</script>

<ul class="w-full max-w-[800px]">
	{#each streams as stream (stream.id)}
		<li
			class="mb-4 flex h-36 w-full justify-between rounded-lg bg-secondary-700 p-4"
			transition:slide={{ duration: 400, easing: quintOut }}
		>
			<span>stream key and credentials over here</span>
			<span>status and actions over here</span>
		</li>
	{/each}
	{#if streams.length < maxStreams}
		<button
			class="relative mb-4 flex h-36 w-full items-center justify-center rounded-[12px]"
			on:click={() => (streams = [...streams, { id: (streams.at(-1)?.id ?? 0) + 1 }])}
			on:mouseenter={() => (isHoveringStreamCreator = true)}
			on:mouseleave={() => (isHoveringStreamCreator = false)}
			transition:slide={{ duration: 400, easing: quintOut }}
		>
			<svg
				width="100%"
				height="100%"
				xmlns="http://www.w3.org/2000/svg"
				class="absolute inset-0 overflow-visible text-neutral-200 transition-colors"
			>
				<rect
					width="100%"
					height="100%"
					fill="none"
					rx="12"
					ry="12"
					stroke="currentcolor"
					stroke-width="2"
					stroke-dasharray="8,18"
					stroke-linecap="square"
					vector-effect="non-scaling-stroke"
					class:slide={isHoveringStreamCreator}
				/>
			</svg>

			<p class="text-lg font-semibold">
				<i class="fa-solid fa-plus" aria-hidden="true"></i>
				Create stream
			</p>
		</button>
	{/if}
</ul>

<style lang="postcss">
	.slide {
		stroke-dashoffset: 0;
		animation: slide 0.45s ease-out both;
	}

	@keyframes slide {
		to {
			stroke-dashoffset: 52;
		}
	}
</style>
