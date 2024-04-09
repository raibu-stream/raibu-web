<script lang="ts">
	import Background from './home/Background.svelte';
	import TeamCarousel from './home/TeamCarousel.svelte';
	import SvelteSeo from 'svelte-seo';
</script>

<SvelteSeo title="Raibu | Low-latency Affordable Streaming" />

<header
	class="relative flex min-h-screen w-full items-center overflow-hidden border-b border-neutral-300 bg-neutral-900 text-center"
>
	<div class="z-10 mb-18 max-w-section-breakout px-16 text-left">
		<h2 class="mb-5 text-7xl">Super cool hero section here</h2>
	</div>
	<Background />
</header>
<section id="About" class="z-10 -mt-18 flex w-full justify-center bg-neutral-800 py-12">
	<div class="max-w-section px-4 text-left">
		<h3 class="mb-4 text-4xl font-bold uppercase tracking-tight">About Us</h3>
		<p class="mb-4 text-xl italic text-neutral-200">
			Lorem ipsum, dolor sit amet consectetur adipisicing elit. Accusamus sequi, voluptatem atque
			rem quam deserunt numquam. Non nulla quia culpa labore laboriosam, ipsum eaque ipsa,
			repellendus modi quod accusantium obcaecati. Lorem ipsum dolor, sit amet consectetur
			adipisicing.
		</p>
	</div>
</section>
<section class="flex w-full justify-center bg-secondary-800 py-8 text-left">
	<div class="w-full max-w-section-breakout px-4">
		<h3 class="mb-4 text-4xl font-bold tracking-tight" id="team-carousel-heading">The Team</h3>
		<TeamCarousel />
	</div>
</section>
