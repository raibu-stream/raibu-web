<script>
	import { fade } from 'svelte/transition';

	let pxScrollFromTop;

	let scrollToTop = () => {
		pxScrollFromTop = 0;
	};
</script>

<svelte:window bind:scrollY={pxScrollFromTop} />

{#if pxScrollFromTop >= 20}
	<div class="absolute top-0 right-0 bottom-0 flex">
		<div class="sticky bottom-0 self-end p-4">
			<button
				id="go-top-btn"
				class="w-12 h-12 rounded-full flex justify-center items-center z-10 !min-w-0 bg-secondary-800 text-neutral-100 border-2 border-primary-400 hover:bg-primary-400 hover:text-neutral-800 transition-colors"
				transition:fade={{ duration: 50 }}
				on:click={scrollToTop}
			>
				<i class="fa-solid fa-arrow-up min-w-[1.5rem]" aria-hidden="true"></i>
				<span class="sr-only">Scroll to top</span>
			</button>
		</div>
	</div>
{/if}
