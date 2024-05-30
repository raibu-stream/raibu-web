<script lang="ts">
	import { createRadioGroup, melt } from '@melt-ui/svelte';
	import type { Writable } from 'svelte/store';

	export let ariaLabel: string;
	export let value: Writable<string>;

	const {
		elements: { root, item, hiddenInput },
		helpers: { isChecked }
	} = createRadioGroup({
		value
	});
</script>

<div use:melt={$root} class="flex gap-3" aria-label={ariaLabel}>
	<slot isChecked={$isChecked} item={$item} />
	<input use:melt={$hiddenInput} />
</div>
