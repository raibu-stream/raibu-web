<script lang="ts">
	import { melt } from '@melt-ui/svelte';

	export let option: any;
	export let isSelected: any;
	export let label: string;
	export let value: any = label;
</script>

<div
	class="flex cursor-pointer rounded-sm py-1 pr-4 text-sm hover:bg-neutral-300 focus:z-10 data-[highlighted]:bg-neutral-300"
	use:melt={option({ value, label })}
>
	<div class="flex min-w-7 items-center justify-center">
		{#if isSelected(value)}
			<i class="fa-solid fa-check"></i>
		{/if}
	</div>

	<span class="truncate">{label}</span>
</div>
