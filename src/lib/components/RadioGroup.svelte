<script lang="ts">
	import { createRadioGroup, melt } from '@melt-ui/svelte';

	export let defaultValue: string;
	export let ariaLabel: string;

	const {
		elements: { root, item, hiddenInput },
		helpers: { isChecked }
	} = createRadioGroup({
		defaultValue
	});
</script>

<div use:melt={$root} class="flex gap-3" aria-label={ariaLabel}>
	<slot isChecked={$isChecked} item={$item} />
	<input use:melt={$hiddenInput} />
</div>
