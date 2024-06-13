<script lang="ts">
	import { createPinInput, melt } from '@melt-ui/svelte';

	export let length = 6;
	let classNames = '';

	const {
		elements: { root, input },
		states: { valueStr }
	} = createPinInput();

	export let value = valueStr;
	export let isFull = false;
	export { classNames as class };
	$: isFull = $value.length === length;
</script>

<fieldset
	class="flex w-full min-w-0 justify-center gap-3 text-xl sm:gap-4 sm:text-2xl"
	use:melt={$root}
>
	<!-- eslint-disable-next-line @typescript-eslint/no-unused-vars -->
	{#each { length } as _}
		<input
			name="code"
			class="aspect-[7/8] min-w-0 max-w-14 grow rounded-xl bg-secondary-800 text-center placeholder:text-neutral-200 {classNames}"
			inputmode="numeric"
			autocomplete="off"
			use:melt={$input()}
		/>
	{/each}
</fieldset>
