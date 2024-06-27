<script lang="ts">
	import { createTooltip, melt, type CreateTooltipProps } from '@melt-ui/svelte';
	import type { Writable } from 'svelte/store';
	import { fade } from 'svelte/transition';

	export let isOpen: undefined | Writable<boolean> = undefined;
	export let defaultOpen = false;
	export let onOpenChange: CreateTooltipProps['onOpenChange'] = undefined;

	const {
		elements: { trigger, content, arrow },
		states: { open }
	} = createTooltip({
		positioning: {
			placement: 'top'
		},
		open: isOpen,
		defaultOpen,
		openDelay: 0,
		closeDelay: 0,
		forceVisible: true,
		onOpenChange
	});

	export { trigger, open };
</script>

<slot trigger={$trigger} />

{#if $open}
	<div
		use:melt={$content}
		transition:fade={{ duration: 100 }}
		class="z-10 select-none rounded-lg bg-neutral-900 text-sm text-neutral-100 shadow"
	>
		<div use:melt={$arrow} />
		<p class="px-4 py-1">
			<slot name="tooltip" />
		</p>
	</div>
{/if}
