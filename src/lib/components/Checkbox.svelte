<script lang="ts">
	import { createCheckbox, melt } from '@melt-ui/svelte';

	let classNames = '';

	export let checked: boolean = false;

	const {
		elements: { root, input },
		helpers: { isChecked }
	} = createCheckbox({
		defaultChecked: checked
	});

	export { isChecked, classNames as class };
</script>

<button
	class="input flex size-6 items-center justify-center p-0 text-lg focus:!outline-none {classNames}"
	use:melt={$root}
>
	{#if $isChecked}
		<i class="fa-solid fa-check text-sm" aria-hidden="true"></i>
	{/if}
	<input use:melt={$input} />
</button>
