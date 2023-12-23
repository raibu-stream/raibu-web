<script lang="ts">
	import Star from './Star.svelte';

	let target = { x: 0, y: 0, ease: 0.05 };
	let innerHeight: number;
	let innerWidth: number;

	let mouseMove = (event: MouseEvent) => {
		target.x = event.clientX / innerWidth;
		target.y = event.clientY / innerHeight;
	};
</script>

<svelte:window bind:innerWidth bind:innerHeight />

<!-- svelte-ignore a11y-no-static-element-interactions -->
<div class="background absolute inset-0 z-0 overflow-hidden" on:mousemove={mouseMove}>
	<!-- eslint-disable-next-line @typescript-eslint/no-unused-vars -->
	{#each { length: 100 } as _}
		<Star mouseTarget={target} />
	{/each}
</div>
