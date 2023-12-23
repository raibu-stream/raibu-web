<script lang="ts">
	import { slide } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';
	import { onDestroy, onMount } from 'svelte';

	export let inside: HTMLElement | undefined = undefined;
	export let close: () => void;

	let dropdown: HTMLElement;

	const onBodyClick = (event: Event) => {
		if (!(inside ?? dropdown).contains(event.target as Node)) {
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
	class="absolute right-0 top-full z-10 mt-2 flex flex-col gap-4 whitespace-nowrap rounded border border-neutral-300 bg-secondary-800 p-4 text-left text-sm tracking-wide"
	transition:slide={{ easing: quintOut, duration: 200 }}
	bind:this={dropdown}
>
	<slot />
</ul>
