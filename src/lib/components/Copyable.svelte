<script lang="ts">
	import { melt } from '@melt-ui/svelte';
	import Tooltip from './Tooltip.svelte';
	import { writable } from 'svelte/store';

	let toCopy: HTMLElement;
	let showSuccessTooltip = false;
	let tooltipIsOpen = writable(false);

	const copy = () => {
		navigator.clipboard.writeText(toCopy.innerText);
		showSuccessTooltip = true;
		tooltipIsOpen.set(true);
		setTimeout(() => {
			showSuccessTooltip = false;
			tooltipIsOpen.set(false);
		}, 2000);
	};
</script>

<Tooltip
	onOpenChange={() => {
		return showSuccessTooltip;
	}}
	isOpen={tooltipIsOpen}
	let:trigger
>
	<button type="button" on:click={copy} use:melt={trigger} class="flex gap-2">
		<span bind:this={toCopy}>
			<slot />
		</span>
		<span>
			<i class="fa-solid fa-copy" aria-hidden="true"></i>
			<span class="sr-only">copy</span>
		</span>
	</button>
	<span slot="tooltip">Copied!</span>
</Tooltip>
