<script>
	import { slide } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';

	let extraClasses = '';
	export { extraClasses as class };
</script>

<div
	class="text-primary-200 text-sm {extraClasses}"
	transition:slide={{ duration: 300, easing: quintOut }}
>
	<i class="fa-solid fa-circle-exclamation" aria-hidden="true"></i>
	<slot />
</div>
