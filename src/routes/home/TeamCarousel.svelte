<script lang="ts">
	import TeamMember from './TeamMember.svelte';
	import vixie from '$lib/img/vixie.jpg';
	import ayaBunnie from '$lib/img/ayabunnie.jpg';
	import babyJack from '$lib/img/babyjack.jpg';
	import ellite from '$lib/img/ellite.jpg';
	import gurg from '$lib/img/gurg.jpg';
	import shaggi from '$lib/img/shaggi.jpg';
	import laura from '$lib/img/laura.jpg';
	import { Splide, SplideSlide, SplideTrack } from '@splidejs/svelte-splide';
	import '@splidejs/svelte-splide/css';
	import { slide } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';

	let splide: any;
	let splideId = '';
	let carouselLength = 0;
	let currentCarouselIndex = 0;
	let currentCarouselAutoplayPercent = 0;
</script>

<Splide
	options={{
		type: 'loop',
		padding: '1rem',
		snap: false,
		perPage: 1,
		gap: '1.5rem',
		perMove: 1,
		autoplay: true,
		focus: 'center',
		mediaQuery: 'min',
		breakpoints: {
			750: {
				perPage: 3
			},
			450: {
				perPage: 2
			}
		},
		interval: 3500
	}}
	hasTrack={false}
	aria-labelled-by="team-carousel-heading"
	bind:this={splide}
	on:mounted={(e) => {
		splideId = e.detail.splide.root.id;
		carouselLength = e.detail.splide.length;
	}}
	on:move={(e) => (e !== undefined ? (currentCarouselIndex = e.detail.index) : undefined)}
	on:autoplayPlaying={(e) =>
		e !== undefined ? (currentCarouselAutoplayPercent = e.detail.rate) : undefined}
>
	<SplideTrack>
		<SplideSlide>
			<TeamMember imageUrl={ellite} name="Ellite" titles={['Founder', 'Project Lead']}>
				<a href="https://twitter.com/ellitedev" target="_blank">
					<i class="fa-brands fa-twitter text-lg" aria-hidden="true"></i>
					<span class="sr-only">Twitter</span>
				</a>
				<a href="https://github.com/ellitedev" target="_blank">
					<i class="fa-brands fa-github text-lg" aria-hidden="true"></i>
					<span class="sr-only">Github</span>
				</a>
				<a href="https://ellite.dev/" target="_blank">
					<i class="fa-solid fa-globe text-lg" aria-hidden="true"></i>
					<span class="sr-only">Website</span>
				</a>
			</TeamMember>
		</SplideSlide>
		<SplideSlide>
			<TeamMember imageUrl={vixie} name="Vixie" titles={['Lead Developer']}>
				<a href="https://twitter.com/VixieTSQ" target="_blank">
					<i class="fa-brands fa-twitter text-lg" aria-hidden="true"></i>
					<span class="sr-only">Twitter</span>
				</a>
				<a href="https://github.com/VixieTSQ" target="_blank">
					<i class="fa-brands fa-github text-lg" aria-hidden="true"></i>
					<span class="sr-only">Github</span>
				</a>
			</TeamMember>
		</SplideSlide>
		<SplideSlide>
			<TeamMember imageUrl={laura} name="Laura Sofia" titles={['Brand Designer']}>
				<a href="https://twitter.com/thatanimeweirdo" target="_blank">
					<i class="fa-brands fa-twitter text-lg" aria-hidden="true"></i>
					<span class="sr-only">Twitter</span>
				</a>
			</TeamMember>
		</SplideSlide>
		<SplideSlide>
			<TeamMember imageUrl={shaggi} name="Shaggi" titles={['Alpha Tester']}>
				<a href="https://twitter.com/EmShaggi" target="_blank">
					<i class="fa-brands fa-twitter text-lg" aria-hidden="true"></i>
					<span class="sr-only">Twitter</span>
				</a>
				<a href="https://soundcloud.com/fmshaggi" target="_blank">
					<i class="fa-brands fa-soundcloud text-lg" aria-hidden="true"></i>
					<span class="sr-only">SoundCloud</span>
				</a>
			</TeamMember>
		</SplideSlide>
		<SplideSlide>
			<TeamMember imageUrl={ayaBunnie} name="ayabunnie" titles={['Alpha Tester']}>
				<a href="https://twitter.com/ayabunnie" target="_blank">
					<i class="fa-brands fa-twitter text-lg" aria-hidden="true"></i>
					<span class="sr-only">Twitter</span>
				</a>
				<a href="https://soundcloud.com/ayabunnie" target="_blank">
					<i class="fa-brands fa-soundcloud text-lg" aria-hidden="true"></i>
					<span class="sr-only">SoundCloud</span>
				</a>
			</TeamMember>
		</SplideSlide>
		<SplideSlide>
			<TeamMember imageUrl={babyJack} name="BabyJack" titles={['Alpha Tester']}>
				<a href="https://twitter.com/BabyJacku" target="_blank">
					<i class="fa-brands fa-twitter text-lg" aria-hidden="true"></i>
					<span class="sr-only">Twitter</span>
				</a>
			</TeamMember>
		</SplideSlide>
		<SplideSlide>
			<TeamMember imageUrl={gurg} name="gurg" titles={['Alpha Tester']}>
				<a href="https://twitter.com/gurgx3" target="_blank">
					<i class="fa-brands fa-twitter text-lg" aria-hidden="true"></i>
					<span class="sr-only">Twitter</span>
				</a>
			</TeamMember>
		</SplideSlide>
	</SplideTrack>

	<div class="splide__arrows">
		<button
			class="splide__arrow splide__arrow--prev ml-2 bg-neutral-200 hover:bg-neutral-100 hover:bg-opacity-75"
		>
			<i class="fa-solid fa-chevron-left text-neutral-900" aria-hidden="true"></i>
			<span class="sr-only">previous</span>
		</button>
		<button
			class="splide__arrow splide__arrow--next mr-2 bg-neutral-200 hover:bg-neutral-100 hover:bg-opacity-75"
		>
			<i class="fa-solid fa-chevron-right text-neutral-900" aria-hidden="true"></i>
			<span class="sr-only">next</span>
		</button>
	</div>

	<ul class="splide__pagination !hidden"></ul>

	<ul
		class="absolute -bottom-6 flex w-full items-center justify-center gap-3"
		role="tablist"
		aria-label="Select a slide to show"
	>
		<button class="splide__toggle mr-4">
			<span class="splide__toggle__play">
				<i class="fa-solid fa-play" aria-hidden="true"></i>
				<span class="sr-only">play</span>
			</span>
			<span class="splide__toggle__pause">
				<i class="fa-solid fa-pause" aria-hidden="true"></i>
				<span class="sr-only">pause</span>
			</span>
		</button>
		<!-- eslint-disable-next-line @typescript-eslint/no-unused-vars -->
		{#each { length: carouselLength } as _, i (i)}
			<li class="flex h-3 min-w-3 rounded-full bg-neutral-200" role="presentation">
				<button
					role="tab"
					aria-label="Go to slide {i + 1}"
					aria-controls="{splideId}-slide{(i + '').padStart(2, '0')}"
					aria-selected={i === currentCarouselIndex}
					on:click={() =>
						i === currentCarouselIndex ? (currentCarouselAutoplayPercent = 0) : splide.go(i)}
					class="min-h-full min-w-full"
				>
					{#if i === currentCarouselIndex}
						<div
							class="h-3 w-8 overflow-hidden rounded-full"
							transition:slide={{ axis: 'x', duration: 250, easing: quintOut }}
							aria-hidden="true"
						>
							<div
								class="h-full rounded-r-full bg-neutral-100"
								style:width={`${currentCarouselAutoplayPercent * 100}%`}
							></div>
						</div>
					{/if}
				</button>
			</li>
		{/each}
	</ul>
</Splide>

<style lang="postcss">
	:global(.splide__slide.is-active .team-member) {
		@apply scale-105;
	}
</style>
