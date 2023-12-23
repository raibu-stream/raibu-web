<script lang="ts">
	import { quintOut } from 'svelte/easing';
	import { fade } from 'svelte/transition';

	export let closeModal: () => void;
	export let title: string;
</script>

<aside
	class="fixed inset-0 z-40 flex items-center justify-center"
	role="dialog"
	transition:fade={{ duration: 200, easing: quintOut }}
>
	<section class="section z-10 !max-w-[450px] !scale-100 !shadow-lg">
		<div class="flex items-start justify-between">
			<h3 class="!text-2xl font-medium">{title}</h3>
			<button
				on:click={closeModal}
				class="text-2xl transition-colors duration-100 hover:text-primary-200"
			>
				<i class="fa-solid fa-xmark" title="Close" aria-hidden="true"></i>
				<span class="sr-only">Close</span>
			</button>
		</div>
		<div class="grid grid-cols-1 grid-rows-1 overflow-hidden"><slot /></div>
	</section>
	<button
		class="fixed inset-0 w-full cursor-default bg-primary-400 bg-opacity-25"
		on:click={closeModal}
	/>
</aside>

<svelte:head>
	<style>
		body {
			overflow-y: hidden;
		}
	</style>
</svelte:head>
