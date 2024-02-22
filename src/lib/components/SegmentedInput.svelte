<script lang="ts">
	import { createPinInput, melt } from '@melt-ui/svelte';

	export let length = 6;

	const {
		elements: { root, input },
		states: { valueStr }
	} = createPinInput();

	export let value = valueStr;
	export let isFull = false;
	$: isFull = $value.length === length;
</script>

<fieldset class="flex gap-3 text-xl sm:gap-4 sm:text-2xl" use:melt={$root}>
	<!-- eslint-disable-next-line @typescript-eslint/no-unused-vars -->
	{#each { length } as _}
		<input
			name="code"
			class="h-12 w-10 rounded-xl bg-secondary-800 text-center placeholder:text-neutral-200 sm:h-16 sm:w-14"
			inputmode="numeric"
			autocomplete="off"
			use:melt={$input()}
		/>
	{/each}
</fieldset>
