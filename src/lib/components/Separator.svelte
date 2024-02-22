<script lang="ts">
	import { createSeparator, melt } from '@melt-ui/svelte';

	export let orientation: 'vertical' | 'horizontal';
	export let decorative = false;

	let classNames: string = '';
	export { classNames as class };

	const {
		elements: { root }
	} = createSeparator({
		orientation,
		decorative
	});
</script>

<div class={classNames} use:melt={$root} />
