<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import Table from '$lib/components/Table.svelte';
	import { dropdown, modal } from '../../../stores.js';
	import UserManagementDropdown from './UserManagementDropdown.svelte';
	import AddUserModal from './AddUserModal.svelte';
	export let data;

	let searchString = '';
	$: currentPage = Number($page.url.searchParams.get('page') || 0);
	let headings = ['Email', 'Is Email Verified', 'Is locked', 'Is Admin', ''];
	let userActionElements: HTMLElement[] = [];

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
	{#each data.users as user, index}
		<tr class="h-12 border-t-2 border-neutral-300">
			<td class="pl-6">
				{user.id}
			</td>
			<td>
				{user.isEmailVerified}
			</td>
			<td>
				{user.isLocked}
			</td>
			<td class="pl-10">
				{user.isAdmin}
			</td>
			<td class="pr-6" bind:this={userActionElements[index]}>
				<div class="overflow-visible">
					<button
						class="text-lg"
						on:click={(event) => {
							event.stopPropagation();

							if (
								$dropdown === undefined ||
								$dropdown.id !== `userManagementDropdown${index} ${currentPage}`
							) {
								$dropdown = {
									from: userActionElements[index],
									component: UserManagementDropdown,
									id: `userManagementDropdown${index} ${currentPage}`,
									offset: { top: -10, left: -10 },
									props: { user }
								};
							} else if ($dropdown.id === `userManagementDropdown${index} ${currentPage}`) {
								$dropdown = undefined;
							}
						}}
					>
						<i class="fa-solid fa-angle-down" aria-hidden="true"></i>
						<span class="sr-only">menu</span>
					</button>
				</div>
			</td>
		</tr>
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

<style lang="postcss">
	td {
		@apply max-w-[10rem] overflow-hidden overflow-ellipsis whitespace-nowrap pr-4;
	}
</style>
