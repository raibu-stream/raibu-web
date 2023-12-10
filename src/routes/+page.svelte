<script>
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
	class="bg-neutral-900 text-center flex justify-center h-[40vh] relative overflow-hidden border-neutral-300 border-b w-full mb-6"
>
	<div class="flex flex-col justify-center items-center z-10 px-6 cursor-default">
		<h2 class="font-bold text-7xl -mb-5">ライブ</h2>
		<div class="pr-8 pl-6 italic w-full flex justify-between text-xl font-normal text-neutral-200">
			<span>ra</span>
			<span class="pl-2">i</span>
			<span>bu</span>
		</div>
	</div>
	<Background />
</header>
<section id="About" class="section">
	<h3>ABOUT</h3>
	<p class="text-neutral-200 text-xl italic mb-4">
		Raibu was born out of the desire to self-host our own simple low-latency streaming server. It is
		NOT a CDN, as we currently only have 1 server in Germany, so it's not really a network.
		Eventually it grew into an idea to provide affordable low-latency streaming to more people.
	</p>
</section>
<section id="Team" class="section">
	<h3>The Team</h3>
	<div class="grid gap-6 grid-cols-[repeat(auto-fit,minmax(300px,1fr))]">
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
