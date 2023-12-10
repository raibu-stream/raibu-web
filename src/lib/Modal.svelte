<script>
	import { quintOut } from 'svelte/easing';
	import { fade } from 'svelte/transition';

	export let closeModal;
	export let title;
</script>

<div
	class="inset-0 fixed flex justify-center items-center z-40"
	transition:fade={{ duration: 200, easing: quintOut }}
>
	<section class="section !scale-100 !shadow-lg !max-w-[450px] z-10">
		<div class="flex justify-between items-start">
			<h3 class="!text-3xl font-semibold">{title}</h3>
			<button
				on:click={closeModal}
				class="text-2xl hover:text-primary-200 transition-colors duration-100"
			>
				<i class="fa-solid fa-xmark" title="Close" aria-hidden="true"></i>
				<span class="sr-only">Close</span>
			</button>
		</div>
		<slot />
	</section>
	<button
		class="inset-0 fixed w-full bg-primary-400 bg-opacity-25 cursor-default"
		on:click={closeModal}
	/>
</div>

<svelte:head>
	<style>
		body {
			overflow-y: hidden;
		}
	</style>
</svelte:head>
