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

<nav class="nav flex justify-between items-center h-[4.5rem] px-6 border-neutral-300 border-b">
	<div class="logo">
		<!-- svg logo from img/logo.svg-->
		<a href="/" class="text-4xl font-bold">ライブ</a>
	</div>
	<div class="menu">
		<ul class="flex items-center gap-6">
			<li><a href="/">Home</a></li>
			<li><a href="#About">About</a></li>
			<li><a href="#Team">Team</a></li>
			<li>
				<a data-sveltekit-preload-data="off" href="/userinfo"
					><button id="login-btn">Login</button></a
				>
			</li>
		</ul>
	</div>
</nav>
<div
	class="bg-neutral-900 text-center flex justify-center h-[40vh] relative overflow-hidden border-neutral-300 border-b"
>
	<div class="title-container flex flex-col justify-center items-center z-10 px-6 cursor-default">
		<h1 class="font-bold text-7xl -mb-3">ライブ</h1>
		<div class="subtitle pr-8 pl-6 italic w-full flex justify-between text-xl font-normal">
			<p>ra</p>
			<p class="pl-2">i</p>
			<p>bu</p>
		</div>
	</div>
	<Background />
</div>
<div class="pagecontainer flex flex-col items-center gap-12 my-6 pb-6">
	<section id="About" class="block">
		<h2>ABOUT</h2>
		<p id="aboutp" class="text-neutral-200 text-xl italic mb-4">
			Raibu was born out of the desire to self-host our own simple low-latency streaming server. It
			is NOT a CDN, as we currently only have 1 server in Germany, so it's not really a network.
			Eventually it grew into an idea to provide affordable low-latency streaming to more people.
		</p>
	</section>
	<section id="Team" class="block shadow">
		<h2>The Team</h2>
		<div class="grid gap-6 grid-cols-[repeat(auto-fit,minmax(300px,1fr))]">
			<TeamMember
				imageUrl={ellite}
				name="Ellite"
				titles={['Founder', 'Lead Developer']}
				twitterUrl="https://twitter.com/ellitedev"
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
			<TeamMember
				imageUrl={vixie}
				name="Vixie"
				titles={['Alpha Tester']}
				twitterUrl="https://twitter.com/VixieTSQ"
			/>
		</div>
	</section>
</div>
<footer class="flex justify-center items-center h-[4.5rem] py-6 border-t border-neutral-300">
	<div class="text-4xl font-bold flex items-center">
		<a href="/">ライブ</a>
	</div>
	<div class="flex items-center">
		<ul
			class="flex items-center gap-6 ml-6 no-underline transition-colors duration-300 ease-in-out text-neutral-100"
		>
			<li><a href="/">Home</a></li>
			<li><a href="#About">About</a></li>
			<li><a href="#Team">Team</a></li>
			<li>
				<a href="https://twitter.com/raibustream" target="_blank"> Twitter/X </a>
			</li>
			<li>
				<a href="https://bsky.app/profile/raibu.stream" target="_blank"> Bluesky </a>
			</li>
		</ul>
	</div>
</footer>

<style lang="postcss">
	section {
		@apply max-w-[800px] w-full shadow-lg hover:shadow-2xl hover:scale-105 transition-transform ease-out rounded p-6 bg-secondary-800 border border-neutral-300;
	}
	h2 {
		@apply text-4xl font-bold mb-6 border-b border-neutral-300;
	}
</style>
