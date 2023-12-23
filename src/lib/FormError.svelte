<script lang="ts">
	import { slide } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';

	let extraClasses = '';
	export { extraClasses as class };
</script>

<div
	class="text-sm text-primary-200 {extraClasses}"
	transition:slide={{ duration: 300, easing: quintOut }}
>
	<i class="fa-solid fa-circle-exclamation" aria-hidden="true"></i>
	<slot />
</div>
