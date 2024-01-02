<script lang="ts">
	import { fade } from 'svelte/transition';

	let pxScrollFromTop: number;

	let scrollToTop = () => {
		pxScrollFromTop = 0;
	};
</script>

<svelte:window bind:scrollY={pxScrollFromTop} />

{#if pxScrollFromTop >= 20}
	<div class="absolute bottom-0 right-0 top-0 flex">
		<div class="sticky bottom-0 self-end p-4">
			<button
				id="go-top-btn"
				class="z-10 flex h-12 w-12 !min-w-0 items-center justify-center rounded-full border-2 border-primary-400 bg-secondary-800 text-neutral-100 transition-colors hover:bg-primary-400 hover:text-neutral-800"
				transition:fade={{ duration: 50 }}
				on:click={scrollToTop}
			>
				<i class="fa-solid fa-arrow-up min-w-[1.5rem]" aria-hidden="true"></i>
				<span class="sr-only">Scroll to top</span>
			</button>
		</div>
	</div>
{/if}
