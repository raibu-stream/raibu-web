<script>
	import { slide } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';
	import { onDestroy, onMount } from 'svelte';

	export let inside = undefined;
	export let close;

	let dropdown;

	const onBodyClick = (event) => {
		if (!(inside ?? dropdown).contains(event.target)) {
			close();
		}
	};

	onMount(() => {
		document.body.addEventListener('click', onBodyClick);
	});

	onDestroy(() => {
		document.body.removeEventListener('click', onBodyClick);
	});
</script>

<ul
	class="absolute top-full right-0 z-10 mt-2 rounded bg-secondary-800 border border-neutral-300 p-4 text-left text-sm tracking-wide flex flex-col gap-4 whitespace-nowrap"
	transition:slide={{ easing: quintOut, duration: 200 }}
	bind:this={dropdown}
>
	<slot />
</ul>
