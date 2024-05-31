<script lang="ts">
	import { showLoginModal } from '../stores';
	import { createDropdownMenu, createTreeView, melt } from '@melt-ui/svelte';
	import Dropdown from '$lib/components/Dropdown.svelte';
	import DropdownItem from '$lib/components/DropdownItem.svelte';
	import DropdownSeparator from '$lib/components/DropdownSeparator.svelte';
	import { invalidateAll } from '$app/navigation';
	import { createDialog } from '@melt-ui/svelte';
	import { fade, fly } from 'svelte/transition';
	import Separator from '$lib/components/Separator.svelte';
	import { toast } from 'svelte-sonner';
	import TopAlert from '$lib/components/TopAlert.svelte';
	import { page } from '$app/stores';

	export let isLoggedIn: boolean;
	export let email: string | undefined;
	export let topAlert: string | undefined;
	export let isAdmin: boolean;

	let login = () => {
		$showLoginModal = true;
	};

	const signOut = async () => {
		await fetch('/user/session', {
			method: 'delete'
		});
		toast.success('Logged out');
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

	const {
		elements: {
			trigger: drawerNavTrigger,
			overlay: drawerNavOverlay,
			content: drawerNavContent,
			close: drawerNavClose
		},
		states: { open: drawerNavOpen }
	} = createDialog();

	let defaultExpanded = [];
	if ($page.url.pathname.startsWith('/admin')) {
		defaultExpanded.push('admin');
	}
	if ($page.url.pathname.startsWith('/user')) {
		defaultExpanded.push('user');
	}
	const {
		elements: { tree, group, item: treeItem },
		helpers: { isExpanded }
	} = createTreeView({
		defaultExpanded: []
	});
</script>

<svelte:window bind:scrollY={pxScrollFromTop} />

<nav
	class="sticky -top-18 z-40 flex h-18 items-center gap-4 border-b border-neutral-300 bg-neutral-800 px-6 transition-all"
	class:!top-0={isScrollingUp || $drawerNavOpen}
	bind:clientHeight={navHeight}
>
	<h1>
		<a href="/" class="link font-jp text-2xl font-semibold tracking-tight sm:text-4xl">ライブ</a>
	</h1>
	<ul class="ml-auto hidden items-center gap-6 font-medium tracking-tight sm:flex">
		<li><a class="link" href="/">Home</a></li>
		<li><a class="link" href="/#About">About</a></li>
		<li><a class="link" href="/#team-carousel-heading">Team</a></li>
		{#if isLoggedIn && email !== undefined}
			<li class="relative mt-auto">
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
	{#if $drawerNavOpen}
		<button class="ml-auto text-xl sm:hidden" use:melt={$drawerNavClose}>
			<i class="fa-solid fa-bars text-neutral-100" aria-hidden="true"></i>
			<span class="sr-only">close menu</span>
		</button>
	{:else}
		<button class="ml-auto text-xl sm:hidden" use:melt={$drawerNavTrigger}>
			<i class="fa-solid fa-bars text-neutral-100" aria-hidden="true"></i>
			<span class="sr-only">Open menu</span>
		</button>
	{/if}
</nav>
{#if topAlert !== undefined}
	<TopAlert topAlert={JSON.parse(topAlert)} />
{/if}

{#if $drawerNavOpen}
	<div
		use:melt={$drawerNavOverlay}
		class="fixed inset-0 z-20 bg-neutral-900/50"
		transition:fade={{ duration: 150 }}
	/>
	<nav
		use:melt={$drawerNavContent}
		class="fixed right-0 top-0 z-30 flex h-screen w-full max-w-[300px] flex-col bg-neutral-800 p-4 pt-18 text-left text-lg font-semibold"
		transition:fly={{
			x: 300,
			duration: 300,
			opacity: 1
		}}
	>
		<div class="relative -top-px -mx-4 mb-6 border-t border-neutral-300"></div>
		{#if isLoggedIn && email !== undefined}
			<div class="px-2 pb-4">
				<button use:melt={$drawerNavClose} class="w-full">
					<a href="/user">
						<div
							class="flex h-14 w-14 items-center justify-center rounded-full border-2 border-primary-200 text-2xl font-semibold uppercase leading-none text-primary-200 transition-colors duration-200 ease-in-out"
						>
							{email[0]}
						</div>
					</a>
					<p class="mt-2 w-3/4 truncate text-left text-sm">
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
			</div>
			<Separator orientation="horizontal" class="mb-4 h-px bg-neutral-300" />
		{/if}
		<ul {...$tree} class="px-2">
			<li class="block pb-4 text-left" use:melt={$treeItem({ id: 'home' })}>
				<button use:melt={$drawerNavClose}>
					<a class="link" href="/">Home</a>
				</button>
			</li>
			<li class="block pb-4 text-left" use:melt={$treeItem({ id: 'about' })}>
				<button use:melt={$drawerNavClose}>
					<a class="link" href="/#About">About</a>
				</button>
			</li>
			<li class="block pb-4 text-left" use:melt={$treeItem({ id: 'team' })}>
				<button use:melt={$drawerNavClose}>
					<a class="link" href="/#team-carousel-heading">Team</a>
				</button>
			</li>
			{#if email !== undefined}
				<li class="block pb-4 text-left">
					<button use:melt={$treeItem({ id: 'user', hasChildren: true })}>
						User
						{#if $isExpanded('user')}
							<i class="fa-solid fa-chevron-down text-xs" aria-hidden="true"></i>
						{:else}
							<i class="fa-solid fa-chevron-up text-xs" aria-hidden="true"></i>
						{/if}
					</button>
					<ul use:melt={$group({ id: 'user' })} class="pl-4 pt-2 text-base">
						<li class="block pb-4 text-left" use:melt={$treeItem({ id: 'dashboard' })}>
							<button use:melt={$drawerNavClose}>
								<a class="link" href="/user">Dashboard</a>
							</button>
						</li>
						<li class="block text-left" use:melt={$treeItem({ id: 'billing' })}>
							<button use:melt={$drawerNavClose}>
								<a class="link" href="/user/billing">Billing</a>
							</button>
						</li>
					</ul>
				</li>
			{/if}
			{#if isAdmin}
				<li class="block pb-4 text-left">
					<button use:melt={$treeItem({ id: 'admin', hasChildren: true })}>
						Admin
						{#if $isExpanded('admin')}
							<i class="fa-solid fa-chevron-down text-xs" aria-hidden="true"></i>
						{:else}
							<i class="fa-solid fa-chevron-up text-xs" aria-hidden="true"></i>
						{/if}
					</button>
					<ul use:melt={$group({ id: 'admin' })} class="pl-4 pt-2 text-base">
						<li class="block pb-4 text-left" use:melt={$treeItem({ id: 'overview' })}>
							<button use:melt={$drawerNavClose}>
								<a class="link" href="/admin">Overview</a>
							</button>
						</li>
						<li class="block pb-4 text-left" use:melt={$treeItem({ id: 'site performance' })}>
							<button use:melt={$drawerNavClose}>
								<a class="link" href="/admin/site">Site performance</a>
							</button>
						</li>
						<li class="block pb-4 text-left" use:melt={$treeItem({ id: 'stream performance' })}>
							<button use:melt={$drawerNavClose}>
								<a class="link" href="/admin/stream">Stream performance</a>
							</button>
						</li>
						<li class="block pb-4 text-left" use:melt={$treeItem({ id: 'users' })}>
							<button use:melt={$drawerNavClose}>
								<a class="link" href="/admin/users">Users</a>
							</button>
						</li>
						<li class="block text-left" use:melt={$treeItem({ id: 'Errors' })}>
							<button use:melt={$drawerNavClose}>
								<a class="link" href="/admin/errors">Errors</a>
							</button>
						</li>
					</ul>
				</li>
			{/if}
		</ul>
		{#if isLoggedIn && email !== undefined}
			<div class="link fixed bottom-4 mt-auto text-sm"></div>
		{:else}
			<Separator orientation="horizontal" class="mb-6 h-px bg-neutral-300" />
			<div class="flex gap-3">
				<button class="button button-invert !text-xs" use:melt={$drawerNavClose}>
					<a class="link" href="/signup">Sign up</a>
				</button>
				<button class="button !text-xs" use:melt={$drawerNavClose} on:m-click={login}>Log in</button
				>
			</div>
		{/if}
	</nav>
{/if}

<Dropdown {menu}>
	<DropdownItem {item}>
		<i class="fa-solid fa-gauge" aria-hidden="true" slot="icon"></i>
		<a href="/user" class="flex h-full w-full items-center">Dashboard</a>
	</DropdownItem>
	<DropdownItem {item}>
		<i class="fa-solid fa-file-invoice" aria-hidden="true" slot="icon"></i>
		<a href="/user/billing" class="flex h-full w-full items-center">Billing</a>
	</DropdownItem>
	<DropdownItem {item}>
		<i class="fa-solid fa-video" aria-hidden="true" slot="icon"></i>
		<a href="/user/streams" class="flex h-full w-full items-center">Streams</a>
	</DropdownItem>
	<DropdownSeparator {separator} />
	<DropdownItem {item} on:click={async () => await signOut()}>
		<i class="fa-solid fa-right-from-bracket" aria-hidden="true" slot="icon"></i>Sign out
	</DropdownItem>
</Dropdown>
