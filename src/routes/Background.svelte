<script>
	import Star from './Star.svelte';

	let target = { x: 0, y: 0, ease: 0.05 };
	let innerHeight;
	let innerWidth;

	let mouseMove = (event) => {
		target.x = event.clientX / innerWidth;
		target.y = event.clientY / innerHeight;
	};
</script>

<svelte:window bind:innerWidth bind:innerHeight />

<!-- svelte-ignore a11y-no-static-element-interactions -->
<div class="background absolute inset-0 overflow-hidden z-0" on:mousemove={mouseMove}>
	<!-- eslint-disable-next-line no-unused-vars -->
	{#each { length: 100 } as _}
		<Star mouseTarget={target} />
	{/each}
</div>
