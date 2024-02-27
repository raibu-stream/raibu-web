<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import Pagination from '$lib/components/Pagination.svelte';
	import Table from '$lib/components/Table.svelte';
	import { writable } from 'svelte/store';
	import ErrorModal from './ErrorModal.svelte';
	import { browser } from '$app/environment';
	import { melt } from '@melt-ui/svelte';
	export let data;

	let modalTrigger: any;
	let errorText = '';

	let searchString = '';
	let searchStringRaw = '';
	const currentPage = writable(Number($page.url.searchParams.get('page') || 0) + 1);
	$: currentPage.set(Number($page.url.searchParams.get('page') || 0) + 1);
	let headings = ['ID', 'Error', 'Date'];

	currentPage.subscribe((val) => {
		if (browser) {
			goto(
				`/admin/errors?page=${val - 1}${searchString !== '' ? `&search=${encodeURIComponent(searchString)}` : ''}`
			);
		}
	});

	const handleSearch = () => {
		searchString = searchStringRaw;
		goto(`/admin/errors?page=${$currentPage - 1}&search=${encodeURIComponent(searchString)}`);
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

<ErrorModal {errorText} bind:trigger={modalTrigger} />

<Table {headings}>
	{#each data.errors as error}
		<tr class="h-12 border-t-2 border-neutral-300">
			<td class="!max-w-[5rem] pl-6">
				{error.errorId}
			</td>
			<td>
				{#if modalTrigger}
					<button
						class="w-full truncate text-left"
						use:melt={$modalTrigger}
						on:m-click={() => (errorText = error.error)}
					>
						<span aria-hidden="true">{error.error}</span>
						<span class="sr-only">View error</span>
					</button>
				{/if}
			</td>
			<td>
				{error.errorDate.toLocaleString()}
			</td>
		</tr>
	{/each}
	<svelte:fragment slot="footer">
		<span aria-hidden="true"></span>
		{#key data.totalErrors}
			<Pagination total={data.totalErrors} perPage={15} {currentPage} />
		{/key}
	</svelte:fragment>
</Table>

<style lang="postcss">
	td {
		@apply max-w-[10rem] truncate pr-4;
	}
</style>
