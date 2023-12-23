<script lang="ts">
	import Background from './Background.svelte';
	import TeamMember from './TeamMember.svelte';

	import vixie from '$lib/img/vixie.jpg';
	import ayaBunnie from '$lib/img/ayabunnie.jpg';
	import babyJack from '$lib/img/babyjack.jpg';
	import ellite from '$lib/img/ellite.jpg';
	import gurg from '$lib/img/gurg.jpg';
	import shaggi from '$lib/img/shaggi.jpg';
</script>

<header
	class="relative mb-6 flex h-[40vh] w-full items-center justify-center overflow-hidden border-b border-neutral-300 bg-neutral-900 text-center"
>
	<div class="group z-10 flex cursor-default flex-col items-center justify-center px-6">
		<h2 class="-mb-5 text-7xl font-extrabold transition-colors group-hover:text-neutral-200">
			ライブ
		</h2>
		<div
			class="flex w-full justify-between pl-6 pr-8 text-xl font-normal italic text-neutral-200 transition-colors group-hover:text-neutral-100"
		>
			<span>ra</span>
			<span class="pl-2">i</span>
			<span>bu</span>
		</div>
	</div>
	<Background />
</header>
<section id="About" class="section">
	<h3 class="uppercase">About</h3>
	<p class="mb-4 text-xl italic text-neutral-200">
		Raibu was born out of the desire to self-host our own simple low-latency streaming server. It is
		NOT a CDN, as we currently only have 1 server in Germany, so it's not really a network.
		Eventually it grew into an idea to provide affordable low-latency streaming to more people.
	</p>
</section>
<section id="Team" class="section">
	<h3>The Team</h3>
	<div class="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-6">
		<TeamMember
			imageUrl={ellite}
			name="Ellite"
			titles={['Founder', 'Lead Developer']}
			twitterUrl="https://twitter.com/ellitedev"
		/>
		<TeamMember
			imageUrl={vixie}
			name="Vixie"
			titles={['Developer']}
			twitterUrl="https://twitter.com/VixieTSQ"
		/>
		<TeamMember
			imageUrl={shaggi}
			name="Shaggi"
			titles={['Alpha Tester']}
			twitterUrl="https://twitter.com/EmShaggi"
		/>
		<TeamMember
			imageUrl={ayaBunnie}
			name="ayabunnie"
			titles={['Alpha Tester']}
			twitterUrl="https://twitter.com/ayabunnie"
		/>
		<TeamMember
			imageUrl={babyJack}
			name="BabyJack"
			titles={['Alpha Tester']}
			twitterUrl="https://twitter.com/BabyJacku"
		/>

		<TeamMember
			imageUrl={gurg}
			name="gurg"
			titles={['Alpha Tester']}
			twitterUrl="https://twitter.com/gurgx3"
		/>
	</div>
</section>
