<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import Table from '$lib/components/Table.svelte';
	import { modal } from '../../../stores.js';
	import ErrorModal from './ErrorModal.svelte';
	export let data;

	let searchString = '';
	$: currentPage = Number($page.url.searchParams.get('page') || 0);
	let headings = ['ID', 'Error', 'Date'];

	const handleSearch = () => {
		goto(`/admin/errors?page=${currentPage}&search=${encodeURIComponent(searchString)}`);
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

<Table {headings}>
	{#each data.errors as error}
		<tr class="h-12 border-t-2 border-neutral-300">
			<td class="!max-w-[5rem] pl-6">
				{error.errorId}
			</td>
			<td>
				<button
					class="w-full overflow-hidden overflow-ellipsis whitespace-nowrap text-left"
					on:click={() => {
						$modal = {
							component: ErrorModal,
							props: { errorText: error.error },
							maxWidthPx: 700,
							title: 'Error'
						};
					}}
				>
					<span aria-hidden="true">{error.error}</span>
					<span class="sr-only">View error</span>
				</button>
			</td>
			<td>
				{error.errorDate.toLocaleString()}
			</td>
		</tr>
	{/each}
	<svelte:fragment slot="footer">
		<span aria-hidden="true"></span>
		<span>
			{currentPage + 1} of {Math.ceil(data.totalErrors / 15)}
			<button
				on:click={() => {
					goto(`/admin/errors?page=${currentPage - 1}`);
				}}
				class="ml-4 disabled:text-neutral-300"
				disabled={currentPage <= 0}
			>
				<i class="fa-solid fa-angle-left" aria-hidden="true"></i>
				<span class="sr-only">previous page</span>
			</button>
			<button
				on:click={() => {
					goto(`/admin/errors?page=${currentPage + 1}`);
				}}
				class="ml-2 disabled:text-neutral-300"
				disabled={currentPage + 1 >= Math.ceil(data.totalErrors / 15)}
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