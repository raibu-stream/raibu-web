<script lang="ts">
	import User from './User.svelte';

	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import Table from '$lib/components/Table.svelte';
	import { modal } from '../../../stores.js';
	import AddUserModal from './AddUserModal.svelte';

	export let data;

	let searchString = '';
	$: currentPage = Number($page.url.searchParams.get('page') || 0);
	let headings = ['Email', 'Is Email Verified', 'Is locked', 'Is Admin', ''];

	const handleSearch = () => {
		goto(`/admin/users?page=${currentPage}&search=${encodeURIComponent(searchString)}`);
	};
</script>

<form on:submit|preventDefault={handleSearch} novalidate>
	<div class="input mb-2 flex max-w-xs items-center gap-2 p-2 px-3 text-left text-sm">
		<button>
			<i class="fa-solid fa-magnifying-glass text-neutral-200" aria-hidden="true"></i>
			<span class="sr-only">search</span>
		</button>
		<input class="grow" type="text" placeholder="Search" bind:value={searchString} />
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
	{#each data.users as user}
		<User {user} />
	{/each}
	<svelte:fragment slot="footer">
		<span>Total of {data.totalUsers} users</span>
		<span>
			{currentPage + 1} of {Math.ceil(data.totalUsers / 15)}
			<button
				on:click={() => {
					goto(`/admin/users?page=${currentPage - 1}`);
				}}
				class="ml-4 disabled:text-neutral-300"
				disabled={currentPage <= 0}
			>
				<i class="fa-solid fa-angle-left" aria-hidden="true"></i>
				<span class="sr-only">previous page</span>
			</button>
			<button
				on:click={() => {
					goto(`/admin/users?page=${currentPage + 1}`);
				}}
				class="ml-2 disabled:text-neutral-300"
				disabled={currentPage + 1 >= Math.ceil(data.totalUsers / 15)}
			>
				<i class="fa-solid fa-angle-right" aria-hidden="true"></i>
				<span class="sr-only">next page</span>
			</button>
		</span>
	</svelte:fragment>
</Table>
