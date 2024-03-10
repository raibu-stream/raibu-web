<script lang="ts">
	import { quintOut } from 'svelte/easing';
	import { scale, slide } from 'svelte/transition';

	let streams: { id: number }[] = [{ id: 0 }];
	let maxStreams = 4;
</script>

<ul class="relative -top-28 w-full scale-90 text-sm">
	{#each streams as stream (stream.id)}
		<li
			class="mb-4 flex h-36 w-full justify-between rounded-lg bg-secondary-700 p-4"
			out:slide={{ duration: 400, easing: quintOut }}
			in:scale={{ duration: 500, easing: quintOut }}
		>
			<span>stream key and credentials over here</span>
			<span class="text-right"
				>status and actions over here<br />
				<span class="inline-flex items-center gap-2 text-sm">
					<i class="fa-solid fa-circle text-happy"></i>
					Online
				</span><br />
				<span class="inline-flex items-center gap-2 text-sm">
					<i class="fa-solid fa-circle text-danger"></i>
					Offline
				</span>
			</span>
		</li>
	{/each}
	{#if streams.length < maxStreams}
		{#key streams}
			<button
				class="group relative mb-4 flex h-36 w-full items-center justify-center rounded-[12px]"
				on:click={() => {
					streams = [...streams, { id: (streams.at(-1)?.id ?? 0) + 1 }];
				}}
				in:slide={{ duration: 400, easing: quintOut, delay: 350 }}
			>
				<svg
					width="100%"
					height="100%"
					xmlns="http://www.w3.org/2000/svg"
					class="absolute inset-0 overflow-visible text-neutral-200 transition-colors group-hover:text-neutral-100"
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
					/>
				</svg>

				<p class="text-lg font-semibold">
					<i class="fa-solid fa-plus" aria-hidden="true"></i>
					Create stream
				</p>
			</button>
		{/key}
	{/if}
</ul>
