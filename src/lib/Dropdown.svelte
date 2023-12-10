<script>
	import { slide } from 'svelte/transition';

	let extraClasses;
	export { extraClasses as class };
</script>

<ul
	class="absolute top-full right-0 mt-2 rounded bg-secondary-800 border border-neutral-300 p-4 text-left {extraClasses}"
	transition:slide
>
	<slot />
</ul>
