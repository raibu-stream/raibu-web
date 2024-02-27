<script lang="ts">
	import { quintOut } from 'svelte/easing';
	import { fade } from 'svelte/transition';
	import { createPopover, melt } from '@melt-ui/svelte';

	export let titleString: string;
	export let defaultOpen = false;
	export let maxWidthPx = 400;

	const {
		elements: { trigger, content, arrow, close },
		states: { open }
	} = createPopover({
		forceVisible: true,
		arrowSize: 16,
		defaultOpen
	});

	export { trigger, open };
</script>

{#if $open}
	<section
		class="w-full border border-neutral-300 bg-secondary-800 p-6 text-left text-neutral-100 shadow-lg section:rounded"
		style:max-width="{maxWidthPx}px"
		transition:fade={{ duration: 200, easing: quintOut }}
		use:melt={$content}
	>
		<div class=" border border-b-0 border-r-0 border-neutral-300" use:melt={$arrow} />
		<div class="flex items-start justify-between">
			<h3 class="mb-4 text-lg font-medium tracking-tight">
				{titleString}
			</h3>
			<button
				class="text-2xl transition-colors duration-100 hover:text-primary-200"
				use:melt={$close}
			>
				<i class="fa-solid fa-xmark" title="Close" aria-hidden="true"></i>
				<span class="sr-only">Close</span>
			</button>
		</div>
		<div class="grid grid-cols-1 grid-rows-1 overflow-hidden">
			<slot close={$close} />
		</div>
	</section>
{/if}
