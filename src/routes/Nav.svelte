<script>
	import LoginModal from '$lib/LoginModal.svelte';
	import { slide } from 'svelte/transition';
	import { invalidateAll } from '$app/navigation';
	import Dropdown from '$lib/Dropdown.svelte';

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
		}).then(async () => {
			await invalidateAll();
		});
	};
</script>

<nav
	class="sm:bg-transparent fixed z-20 flex h-18 w-full items-center gap-4 border-b border-neutral-300 bg-neutral-800 px-6 sm:static sm:w-auto"
>
	<h1>
		<a href="/" class="text-2xl font-extrabold tracking-tight sm:text-4xl">ライブ</a>
	</h1>
	<ul class="ml-auto hidden items-center gap-6 font-medium tracking-tight sm:flex">
		<li><a href="/">Home</a></li>
		<li><a href="/#About">About</a></li>
		<li><a href="/#Team">Team</a></li>
		{#if loggedIn}
			<li class="relative mt-auto" bind:this={userDropdown}>
				<button
					class="link flex items-center gap-3"
					on:click={() => (userDropdownOpen = !userDropdownOpen)}
				>
					<i class="fa-solid fa-circle-user text-4xl"></i>
				</button>
				{#if userDropdownOpen}
					<Dropdown inside={userDropdown} close={() => (userDropdownOpen = false)}>
						<li>
							<a href="/user" on:click={() => (userDropdownOpen = false)}>
								<i class="fa-solid fa-gauge" aria-hidden="true"></i>
								Dashboard
							</a>
						</li>
						<hr class="text-neutral-300" />
						<li>
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
					</Dropdown>
				{/if}
			</li>
		{:else}
			<li><a class="button button-invert -mr-4 whitespace-nowrap" href="/signup">Sign up</a></li>
			<li>
				<button on:click={login} class="button">Log in</button>
			</li>
		{/if}
	</ul>
	<button on:click={toggleMobileNavOpen} class="ml-auto text-xl sm:hidden">
		<i class="fa-solid fa-bars text-neutral-100" aria-hidden="true"></i>
		<span class="sr-only">Open menu</span>
	</button>

	{#if mobileNavOpen}
		<ul
			transition:slide={{ duration: 300, axis: 'x' }}
			class="fixed right-0 top-0 -z-10 flex h-screen w-[75%] flex-col bg-neutral-800 p-4 pt-18 text-left text-lg font-semibold"
		>
			<div class="relative -top-px -mx-4 mb-6 border-t border-neutral-300"></div>
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
			<hr class="mb-4 border-neutral-300" class:mb-6={!loggedIn} />
			{#if loggedIn}
				<li><button class="link" on:click={signOut}>Sign out</button></li>
				<li class="fixed bottom-3 mt-auto">
					<button class="w-full" on:click={toggleMobileNavOpen}>
						<a href="/user" class="mb-1 flex items-center gap-2">
							<i class="fa-solid fa-circle-user text-3xl"></i>
							<span
								class="min-w-0 overflow-hidden text-ellipsis whitespace-nowrap text-sm italic text-neutral-200"
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
