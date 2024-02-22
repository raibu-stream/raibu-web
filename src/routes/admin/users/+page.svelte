<script lang="ts">
	import User from './User.svelte';

	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import Table from '$lib/components/Table.svelte';
	import { modal } from '../../../stores.js';
	import AddUserModal from './AddUserModal.svelte';
	import Pagination from '$lib/components/Pagination.svelte';
	import { writable } from 'svelte/store';
	import { browser } from '$app/environment';

	export let data;

	let searchString = '';
	let searchStringRaw = '';
	const currentPage = writable(Number($page.url.searchParams.get('page') || 0) + 1);
	$: currentPage.set(Number($page.url.searchParams.get('page') || 0) + 1);
	let headings = ['Email', 'Is Email Verified', 'Is locked', 'Is Admin', ''];

	currentPage.subscribe((val) => {
		if (browser) {
			goto(
				`/admin/users?page=${val - 1}${searchString !== '' ? `&search=${encodeURIComponent(searchString)}` : ''}`
			);
		}
	});

	const handleSearch = () => {
		searchString = searchStringRaw;
		goto(`/admin/users?page=${$currentPage - 1}&search=${encodeURIComponent(searchString)}`);
	};
</script>

<form on:submit|preventDefault={handleSearch} novalidate>
	<div class="input mb-2 flex max-w-xs items-center gap-2 p-2 px-3 text-left text-sm">
		<button>
			<i class="fa-solid fa-magnifying-glass text-neutral-200" aria-hidden="true"></i>
			<span class="sr-only">search</span>
		</button>
		<input class="grow" type="text" placeholder="Search" bind:value={searchStringRaw} />
	</div>
</form>

<Table
	{headings}
	add={() => {
		$modal = {
			component: AddUserModal,
			title: 'Add User'
		};
	}}
>
	{#each data.users as user (user.id)}
		<User {user} />
	{/each}
	<svelte:fragment slot="footer">
		<span>Total of {data.totalUsers} users</span>
		{#key data.totalUsers}
			<Pagination total={data.totalUsers} perPage={15} {currentPage} />
		{/key}
	</svelte:fragment>
</Table>
