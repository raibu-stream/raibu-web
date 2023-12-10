<script>
	import LoginModal from '$lib/LoginModal.svelte';
	import { slide } from 'svelte/transition';
	import { browser } from '$app/environment';
	import { quintOut } from 'svelte/easing';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';

	export let loggedIn;
	export let email;

	let userDropdown;

	let mobileNavOpen = false;
	let userDropdownOpen = false;
	let loginModalOn = false;

	let toggleMobileNavOpen = () => (mobileNavOpen = !mobileNavOpen);
	let login = () => {
		mobileNavOpen = false;
		loginModalOn = true;
	};

	const signOut = () => {
		return fetch('/user/session', {
			method: 'delete'
		}).then(() =>
			goto('/', {
				invalidateAll: true
			})
		);
	};

	onMount(() => {
		if (userDropdown !== undefined) {
			document.body.addEventListener('click', (event) => {
				if (!userDropdown.contains(event.target)) {
					userDropdownOpen = false;
				}
			});
		}
	});
</script>

<nav
	class="fixed w-full bg-neutral-800 z-20 sm:static sm:w-auto sm:bg-transparent flex items-center gap-4 h-18 px-6 border-neutral-300 border-b"
>
	<h1><a href="/" class="sm:text-4xl text-2xl font-bold">ライブ</a></h1>
	<ul class="sm:flex items-center gap-6 hidden ml-auto">
		<li><a href="/">Home</a></li>
		<li><a href="/#About">About</a></li>
		<li><a href="/#Team">Team</a></li>
		{#if loggedIn}
			<li class="mt-auto relative" bind:this={userDropdown}>
				<button
					class="flex items-center gap-3 link"
					on:click={() => (userDropdownOpen = !userDropdownOpen)}
				>
					<i class="fa-solid fa-circle-user text-4xl"></i>
				</button>
				{#if userDropdownOpen}
					<ul
						class="absolute top-full right-0 z-10 mt-2 rounded bg-secondary-800 border border-neutral-300 p-4 text-left text-sm"
						transition:slide={{ easing: quintOut, duration: 200 }}
					>
						<li class="mb-4 whitespace-nowrap">
							<a href="/user" on:click={() => (userDropdownOpen = false)}>
								<i class="fa-solid fa-gauge" aria-hidden="true"></i>
								Dashboard
							</a>
						</li>
						<hr class="mb-4 text-neutral-300" />
						<li class="whitespace-nowrap">
							<button
								class="link"
								on:click={async () => {
									userDropdownOpen = false;
									await signOut();
								}}
							>
								<i class="fa-solid fa-right-from-bracket" aria-hidden="true"></i>
								Sign out
							</button>
						</li>
					</ul>
				{/if}
			</li>
		{:else}
			<li><a class="button button-invert -mr-4 whitespace-nowrap" href="/signup">Sign up</a></li>
			<li>
				<button on:click={login} class="button">Log in</button>
			</li>
		{/if}
	</ul>
	<button on:click={toggleMobileNavOpen} class="sm:hidden text-xl ml-auto">
		<i class="fa-solid fa-bars text-neutral-100" aria-hidden="true"></i>
		<span class="sr-only">Open menu</span>
	</button>

	{#if mobileNavOpen}
		<ul
			transition:slide={{ duration: 300, axis: 'x' }}
			class="fixed top-0 pt-18 right-0 h-screen w-[75%] bg-neutral-800 -z-10 p-4 text-left text-lg font-semibold flex flex-col"
		>
			<div class="mb-6 border-t border-neutral-300 -mx-4 relative -top-px"></div>
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
			<hr class="border-neutral-300 mb-4" class:mb-6={!loggedIn} />
			{#if loggedIn}
				<li><button class="link" on:click={signOut}>Sign out</button></li>
				<li class="mt-auto">
					<button class="w-full" on:click={toggleMobileNavOpen}>
						<a href="/user" class="flex items-center gap-2 mb-1">
							<i class="fa-solid fa-circle-user text-3xl"></i>
							<span
								class="text-sm text-neutral-200 italic text-ellipsis whitespace-nowrap overflow-hidden min-w-0"
							>
								{email}
							</span>
						</a>
					</button>
				</li>
			{:else}
				<li class="flex gap-3">
					<button class="button button-invert !text-xs" on:click={toggleMobileNavOpen}>
						<a href="/signup">Sign up</a>
					</button>
					<button class="button !text-xs" on:click={login}>Log in</button>
				</li>
			{/if}
		</ul>
	{/if}
</nav>

{#key loginModalOn}
	<LoginModal bind:loginModalOn />
{/key}
