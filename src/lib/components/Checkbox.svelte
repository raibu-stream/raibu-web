<script lang="ts">
	import { createCheckbox, melt } from '@melt-ui/svelte';

	let classNames = '';

	const {
		elements: { root, input },
		helpers: { isChecked }
	} = createCheckbox({});

	export { isChecked, classNames as class };
</script>

<button class="input size-7 p-0 text-lg focus:!outline-none {classNames}" use:melt={$root}>
	{#if $isChecked}
		<i class="fa-solid fa-check" aria-hidden="true"></i>
	{/if}
	<input use:melt={$input} />
</button>
