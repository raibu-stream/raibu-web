<script>
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';

	export let mouseTarget;

	let speed;
	let speedOffset = 0;

	let left = Math.random() * 100;
	let top = Math.random() * 100;
	let translateX = 0;
	let translateY = 0;

	let reduceMotion = browser
		? window.matchMedia('(prefers-reduced-motion: reduce)').matches
		: false;

	let rand = Math.random();
	if (rand < 0.15) {
		speed = 'fast';
		speedOffset = 0.4;
	} else if (rand < 0.3) {
		speed = 'normal';
		speedOffset = 0.3;
	} else if (rand < 0.6) {
		speed = 'slow';
		speedOffset = 0.2;
	} else {
		speed = 'slowest';
		speedOffset = 0.1;
	}

	let animateStar = () => {
		if (left < 0) {
			left = 100;
		} else {
			left -= speedOffset;
		}
		requestAnimationFrame(animateStar);
	};
	let updateMouseOffset = () => {
		translateX += (mouseTarget.x - translateX) * mouseTarget.ease;
		translateY += (mouseTarget.y - translateY) * mouseTarget.ease;
		requestAnimationFrame(updateMouseOffset);
	};

	onMount(() => {
		if (!reduceMotion) {
			animateStar();
			updateMouseOffset();
		}
	});
</script>

<div
	class="star absolute h-[2px] w-[2px] rounded-full bg-neutral-100 shadow-neutral-100 {speed ===
	'fast'
		? 'after:to-transparent after:absolute after:left-0 after:top-0 after:h-[2px] after:w-[100px] after:origin-right after:bg-gradient-to-r after:from-neutral-100'
		: ''}"
	style:top="{top}%"
	style:left="{left}%"
	style:transform="translate({translateX * 50}px, {translateY * 50}px)"
/>

<style lang="postcss">
	.star {
		box-shadow: 0 0 2px var(--tw-shadow-color);
	}
</style>
