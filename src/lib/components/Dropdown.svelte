<script lang="ts">
	import { slide } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';
	import { onDestroy, onMount } from 'svelte';
	import { dropdown } from '../../stores';
	import { onNavigate } from '$app/navigation';
	import { browser } from '$app/environment';

	let dropdownElement: HTMLElement;
	let top = 0;
	let left = 0;

	const onBodyClick = (event: MouseEvent) => {
		if ($dropdown) {
			if (
				!(
					$dropdown.from.contains(event.target as Node) ||
					dropdownElement.contains(event.target as Node)
				)
			) {
				$dropdown = undefined;
			}
		}
	};

	const updatePosition = () => {
		if ($dropdown) {
			let box = $dropdown.from.getBoundingClientRect();

			top = box.bottom + window.scrollY + ($dropdown.offset?.top ?? 0);
			left = box.right + window.scrollX + ($dropdown.offset?.left ?? 0);
		}
	};

	dropdown.subscribe(() => updatePosition());

	onNavigate(() => {
		$dropdown = undefined;
	});

	onMount(() => {
		if (browser) {
			document.body.addEventListener('click', onBodyClick);
			window.addEventListener('scroll', updatePosition, true);
		}
	});

	onDestroy(() => {
		if (browser) {
			document.body.removeEventListener('click', onBodyClick);
		}
	});
</script>

{#if $dropdown}
	<div
		class="absolute z-30 -translate-x-full whitespace-nowrap rounded border border-neutral-300 bg-secondary-800 text-left text-sm tracking-wide"
		transition:slide={{ easing: quintOut, duration: 200 }}
		bind:this={dropdownElement}
		style:top="{top}px"
		style:left="{left}px"
	>
		<svelte:component this={$dropdown.component} {...$dropdown.props}></svelte:component>
	</div>
{/if}
