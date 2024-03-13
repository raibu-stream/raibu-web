<script lang="ts">
	import { melt } from '@melt-ui/svelte';

	export let item: any;
	export let isChecked: any;
	export let value: string;
</script>

<button
	use:melt={item(value)}
	class="button flex h-12 items-center gap-4"
	class:button-invert={!isChecked(value)}
	id={value}
	aria-labelledby="{value}-label"
>
	<div class="flex size-5 items-center justify-center rounded-full bg-secondary-700">
		{#if isChecked(value)}
			<div class="size-2.5 rounded-full bg-primary-200" />
		{/if}
	</div>
	<label class="font-medium capitalize leading-none" for={value} id="{value}-label">
		{value}
	</label>
</button>
