<script lang="ts">
	import { slide } from 'svelte/transition';

	let mobileNavOpen = false;

	let toggleMobileNavOpen = () => (mobileNavOpen = !mobileNavOpen);
</script>

<nav
	class="fixed w-full bg-neutral-800 z-20 sm:static sm:w-auto sm:bg-transparent flex justify-between items-center h-18 px-6 border-neutral-300 border-b"
>
	<div>
		<a href="/" class="text-4xl font-bold">ライブ</a>
	</div>
	<ul class="sm:flex items-center gap-6 hidden">
		<li><a href="/">Home</a></li>
		<li><a href="/#About">About</a></li>
		<li><a href="/#Team">Team</a></li>
		<li><button class="button button-invert -mr-4">Sign up</button></li>
		<li>
			<a data-sveltekit-preload-data="off" href="/user"><button class="button">Login</button></a>
		</li>
	</ul>
	<button on:click={toggleMobileNavOpen} class="sm:hidden text-xl">
		<i class="fa-solid fa-bars text-neutral-100"></i>
	</button>
	{#if mobileNavOpen}
		<ul
			transition:slide={{ duration: 300, axis: 'x' }}
			class="fixed top-18 right-0 h-full bg-neutral-800 z-20 p-4 text-left text-lg font-semibold"
		>
			<li class="pb-4">
				<button on:click={toggleMobileNavOpen}>
					<a href="/">Home</a>
				</button>
			</li>
			<li class="pb-4">
				<button on:click={toggleMobileNavOpen}>
					<a href="/#About">About</a>
				</button>
			</li>
			<li class="pb-4">
				<button on:click={toggleMobileNavOpen}>
					<a href="/#Team">Team</a>
				</button>
			</li>
			<hr class="border-neutral-300 mb-6" />
			<li class="flex gap-3">
				<button class="button button-invert !text-xs" on:click={toggleMobileNavOpen}>Sign up</button
				>
				<a data-sveltekit-preload-data="off" href="/user">
					<button class="button !text-xs" on:click={toggleMobileNavOpen}>Login</button>
				</a>
			</li>
		</ul>
	{/if}
</nav>
