<script lang="ts">
	import { quintOut } from 'svelte/easing';
	import { fade } from 'svelte/transition';
	import { createDialog, melt } from '@melt-ui/svelte';
	import type { Writable } from 'svelte/store';

	export let titleString: string;
	export let type: 'dialog' | 'alertdialog' = 'dialog';
	export let maxWidthPx = 450;
	export let isOpen: Writable<boolean> | undefined = undefined;

	export const {
		elements: { trigger, overlay, content, title, close },
		states: { open }
	} = createDialog({
		role: type,
		open: isOpen
	});
</script>

{#if $open}
	<aside
		class="fixed inset-0 z-50 flex items-center justify-center"
		transition:fade={{ duration: 200, easing: quintOut }}
	>
		<div
			use:melt={$overlay}
			class="fixed inset-0 bg-primary-400 bg-opacity-25"
			transition:fade={{ duration: 150 }}
		/>
		<section
			class="z-10 w-full border border-neutral-300 bg-secondary-800 p-6 text-left shadow-lg section:rounded"
			style:max-width="{maxWidthPx}px"
			use:melt={$content}
		>
			<div class="flex items-start justify-between">
				<h3
					class="mb-6 border-b border-neutral-300 text-2xl font-medium tracking-tight"
					use:melt={$title}
				>
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
				<slot />
			</div>
		</section>
	</aside>
{/if}
