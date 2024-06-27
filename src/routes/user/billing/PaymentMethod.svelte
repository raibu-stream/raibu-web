<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import Dropdown from '$lib/components/Dropdown.svelte';
	import DropdownItem from '$lib/components/DropdownItem.svelte';
	import { handleApiResponse } from '$lib/utils';
	import { createDropdownMenu, melt } from '@melt-ui/svelte';
	import { toast } from 'svelte-sonner';
	import type { PageData } from './$types';
	import Copyable from '$lib/components/Copyable.svelte';

	export let method: Awaited<PageData['paymentMethods']>[0];
	export let inUse: boolean = false;

	const deleteMethod = () => {
		toast.promise(
			fetch('./billing/payment-method', {
				method: 'DELETE',
				body: JSON.stringify({ paymentMethodId: method.id })
			})
				.then(async (res) => {
					return handleApiResponse(res, async () => {
						invalidateAll();
					});
				})
				.then((res) => {
					if (res !== undefined) {
						throw res;
					}
				}),
			{
				loading: 'Loading...',
				success: 'Deleted!',
				error: (err) => (typeof err === 'string' ? err : 'An unexpected error occured')
			}
		);
	};

	const setMethodPrimary = () => {
		toast.promise(
			fetch('./subscribe', {
				method: 'PATCH',
				body: JSON.stringify({ paymentMethodId: method.id })
			})
				.then(async (res) => {
					return handleApiResponse(res, async () => {
						invalidateAll();
					});
				})
				.then((res) => {
					if (res !== undefined) {
						throw res;
					}
				}),
			{
				loading: 'Loading...',
				success: 'Deleted!',
				error: (err) => (typeof err === 'string' ? err : 'An unexpected error occured')
			}
		);
	};

	const {
		elements: { menu, item, trigger }
	} = createDropdownMenu();
</script>

<div class="w-full rounded bg-secondary-700 p-4 shadow-md">
	<div class="flex items-start justify-between">
		<h4 class="mb-2 flex min-w-0 items-center gap-3">
			{#if method.type === 'card'}
				<i class="fa-solid fa-credit-card text-lg" aria-hidden="true"></i>
				<span class="sr-only">credit card</span>
			{:else if method.type === 'paypal'}
				<i class="fa-brands fa-paypal text-xl" aria-hidden="true"></i>
				<span class="sr-only">paypal</span>
			{:else if method.type === 'sepa_debit'}
				<i class="fa-solid fa-building-columns text-lg" aria-hidden="true"></i>
				<span class="sr-only">sepa debit</span>
			{/if}
			<span class="min-w-0 truncate">
				{#if method.type === 'card'}
					************{method.last4}
				{:else if method.type === 'paypal'}
					{method.maskedEmail}
				{:else if method.type === 'sepa_debit'}
					**** **** **** **** **{method.last4?.slice(0, 2)} {method.last4?.slice(3)}
				{/if}
			</span>
		</h4>
		{#if !inUse}
			<button class="pl-4 pr-1" use:melt={$trigger}>
				<i class="fa-solid fa-ellipsis-vertical" aria-hidden="true"></i>
				<span class="sr-only">actions</span>
			</button>
		{/if}
	</div>

	<div class="flex gap-2 text-xs text-neutral-200">
		<div class="flex gap-2">
			ID:
			<Copyable>
				<div class="max-w-24 truncate">{method.id}</div>
			</Copyable>
		</div>
		{#if method.type === 'card'}
			<div class="border-l-2 pl-2">Expires {method.expiration}</div>
		{/if}
	</div>
</div>

<Dropdown {menu}>
	<DropdownItem {item} on:click={setMethodPrimary}>Set as primary</DropdownItem>
	<DropdownItem {item} on:click={deleteMethod}>Delete</DropdownItem>
</Dropdown>
