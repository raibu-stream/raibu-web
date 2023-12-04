<script>
	import { fade } from 'svelte/transition';

	let pxScrollFromTop;

	let scrollToTop = () => {
		pxScrollFromTop = 0;
	};
</script>

<svelte:window bind:scrollY={pxScrollFromTop} />

{#if pxScrollFromTop >= 20}
	<button
		id="go-top-btn"
		class="fixed bottom-6 right-6 w-12 h-12 rounded-full flex justify-center items-center z-10 !min-w-0 bg-secondary-800 text-neutral-100 border-2 border-primary-400 hover:bg-primary-400 hover:text-neutral-800"
		transition:fade={{ duration: 30 }}
		on:click={scrollToTop}
	>
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="24"
			height="24"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="2"
			stroke-linecap="round"
			stroke-linejoin="round"
			class="min-w-[1.5rem]"
		>
			<line x1="12" y1="19" x2="12" y2="5"></line>
			<polyline points="5 12 12 5 19 12"></polyline>
		</svg>
	</button>
{/if}
