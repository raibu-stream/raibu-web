<script lang="ts">
	import LoginModal from '$lib/components/LoginModal.svelte';
	import { slide } from 'svelte/transition';
	import { dropdown, modal } from '../stores';
	import { createDropdownMenu, melt } from '@melt-ui/svelte';
	import Dropdown from '$lib/components/Dropdown.svelte';
	import DropdownItem from '$lib/components/DropdownItem.svelte';
	import DropdownSeparator from '$lib/components/DropdownSeparator.svelte';
	import { invalidateAll } from '$app/navigation';

	export let loggedIn: boolean;
	export let email: string | undefined;

	let userDropdown: HTMLElement;

	let mobileNavOpen = false;

	let toggleMobileNavOpen = () => (mobileNavOpen = !mobileNavOpen);
	let login = () => {
		mobileNavOpen = false;
		$modal = {
			component: LoginModal,
			title: 'Login'
		};
	};

	const signOut = async () => {
		await fetch('/user/session', {
			method: 'delete'
		});
		await invalidateAll();
	};

	const onScroll = (pxScrollFromTop: number) => {
		if (pxScrollFromTop === 0) {
			isScrollingUp = false;
		}

		if (Math.abs(previousPxScrollFromTop - pxScrollFromTop) <= 5) return;

		if (pxScrollFromTop < previousPxScrollFromTop && pxScrollFromTop > navHeight) {
			isScrollingUp = true;
		} else if (pxScrollFromTop < navHeight) {
			isScrollingUp = isScrollingUp;
		} else {
			isScrollingUp = false;
		}

		previousPxScrollFromTop = pxScrollFromTop;
	};

	let pxScrollFromTop = 0;
	let previousPxScrollFromTop = 0;
	let isScrollingUp = false;
	let navHeight = 0;
	let didScroll = false;

	setInterval(() => {
		if (didScroll) {
			onScroll(pxScrollFromTop);
			didScroll = false;
		}
	}, 250);

	$: {
		pxScrollFromTop;
		didScroll = true;
	}

	const {
		elements: { menu, item, trigger, separator }
	} = createDropdownMenu();
</script>

<svelte:window bind:scrollY={pxScrollFromTop} />

<nav
	class="sticky -top-18 z-20 flex h-18 items-center gap-4 border-b border-neutral-300 bg-neutral-800 px-6 transition-all"
	class:!top-0={isScrollingUp || mobileNavOpen}
	bind:clientHeight={navHeight}
>
	<h1>
		<a href="/" class="link font-jp text-2xl font-semibold tracking-tight sm:text-4xl">ライブ</a>
	</h1>
	<ul class="ml-auto hidden items-center gap-6 font-medium tracking-tight sm:flex">
		<li><a class="link" href="/">Home</a></li>
		<li><a class="link" href="/#About">About</a></li>
		<li><a class="link" href="/#Team">Team</a></li>
		{#if loggedIn && email !== undefined}
			<li class="relative mt-auto" bind:this={userDropdown}>
				<button
					class="flex h-10 w-10 items-center justify-center rounded-full border border-transparent bg-primary-400 text-xl font-semibold uppercase leading-none text-neutral-100 transition-colors duration-100"
					use:melt={$trigger}
				>
					{email[0]}
				</button>
			</li>
		{:else}
			<li>
				<a class="button button-invert link -mr-4 whitespace-nowrap" href="/signup">Sign up</a>
			</li>
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
			class="fixed right-0 top-0 -z-10 flex h-screen w-5/6 flex-col bg-neutral-800 p-4 pt-18 text-left text-lg font-semibold"
		>
			<div class="relative -top-px -mx-4 mb-6 border-t border-neutral-300"></div>
			{#if loggedIn && email !== undefined}
				<li class="mb-4 border-b border-neutral-300 pb-4">
					<button on:click={toggleMobileNavOpen} class="w-full">
						<a href="/user">
							<div
								class="flex h-14 w-14 items-center justify-center rounded-full border-2 border-primary-200 text-2xl font-semibold uppercase leading-none text-primary-200 transition-colors duration-200 ease-in-out"
							>
								{email[0]}
							</div>
						</a>
						<p class="mt-2 w-3/4 overflow-hidden text-ellipsis whitespace-nowrap text-left text-sm">
							{email}
						</p>
					</button>
					<button
						class="link flex w-full items-center gap-2 text-sm text-neutral-200"
						on:click={signOut}
					>
						<i class="fa-solid fa-right-from-bracket" aria-hidden="true"></i>
						Sign out
					</button>
				</li>
			{/if}
			<li class="pb-4">
				<button on:click={toggleMobileNavOpen}>
					<a class="link" href="/">Home</a>
				</button>
			</li>
			<li class="pb-4">
				<button on:click={toggleMobileNavOpen}>
					<a class="link" href="/#About">About</a>
				</button>
			</li>
			<li class="pb-4">
				<button on:click={toggleMobileNavOpen}>
					<a class="link" href="/#Team">Team</a>
				</button>
			</li>
			{#if loggedIn && email !== undefined}
				<li class="link fixed bottom-4 mt-auto text-sm"></li>
			{:else}
				<hr class="mb-6 border-neutral-300" />
				<li class="flex gap-3">
					<button class="button button-invert !text-xs" on:click={toggleMobileNavOpen}>
						<a class="link" href="/signup">Sign up</a>
					</button>
					<button class="button !text-xs" on:click={login}>Log in</button>
				</li>
			{/if}
		</ul>
	{/if}
</nav>

<Dropdown {menu}>
	<DropdownItem {item}>
		<i class="fa-solid fa-gauge" aria-hidden="true" slot="icon"></i>
		<a href="/user" class="flex h-full w-full items-center">Dashboard</a>
	</DropdownItem>
	<DropdownSeparator {separator} />
	<DropdownItem {item} on:click={async () => await signOut()}>
		<i class="fa-solid fa-right-from-bracket" aria-hidden="true" slot="icon"></i>Sign out
	</DropdownItem>
</Dropdown>
