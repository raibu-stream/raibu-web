<script lang="ts">
	import { createCheckbox, melt } from '@melt-ui/svelte';

	const {
		elements: { root, input },
		helpers: { isChecked }
	} = createCheckbox({});

	export { isChecked };
</script>

<button class="input size-7 p-0 text-lg focus:!outline-none" use:melt={$root}>
	{#if $isChecked}
		<i class="fa-solid fa-check" aria-hidden="true"></i>
	{/if}
	<input use:melt={$input} />
</button>
