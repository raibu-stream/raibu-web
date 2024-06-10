<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import Dropdown from '$lib/components/Dropdown.svelte';
	import DropdownItem from '$lib/components/DropdownItem.svelte';
	import { handleApiResponse } from '$lib/utils';
	import { createDropdownMenu, melt } from '@melt-ui/svelte';
	import { toast } from 'svelte-sonner';

	export let method:
		| {
				token: string;
				maskedEmail: string;
		  }
		| {
				token: string;
				maskedNumber: string;
				expiration: string | undefined;
		  };
	export let inUse: boolean = false;

	const isPaypal = (
		method: any
	): method is {
		token: string;
		maskedEmail: string;
	} => {
		return method.maskedEmail !== undefined;
	};

	const deleteMethod = () => {
		toast.promise(
			fetch('./billing/payment-method', {
				method: 'DELETE',
				body: JSON.stringify({ paymentMethodToken: method.token })
			})
				.then(async (res) => {
					return handleApiResponse(res, async () => {
						invalidateAll();
					});
				})
				.then((res) => {
					if (res !== undefined) {
						toast.error(res);
					}
				}),
			{
				loading: 'Loading...',
				success: 'Deleted!',
				error: 'An error occurred.'
			}
		);
	};

	const setMethodPrimary = () => {
		toast.promise(
			fetch('./subscribe', {
				method: 'PATCH',
				body: JSON.stringify({ paymentMethodToken: method.token })
			})
				.then(async (res) => {
					return handleApiResponse(res, async () => {
						invalidateAll();
					});
				})
				.then((res) => {
					if (res !== undefined) {
						toast.error(res);
					}
				}),
			{
				loading: 'Loading...',
				success: 'Deleted!',
				error: 'An error occurred.'
			}
		);
	};

	const {
		elements: { menu, item, trigger }
	} = createDropdownMenu();
</script>

<div class="w-full rounded bg-secondary-700 p-4 shadow-md">
	{#if !isPaypal(method)}
		<div class="flex items-start justify-between">
			<h4 class="mb-2 flex min-w-0 items-center gap-3">
				<i class="fa-solid fa-credit-card text-lg" aria-hidden="true"></i>
				<span class="sr-only">credit card</span>
				<span class="min-w-0 truncate">{method.maskedNumber}</span>
			</h4>
			{#if !inUse}
				<button class="pl-4 pr-1" use:melt={$trigger}>
					<i class="fa-solid fa-ellipsis-vertical" aria-hidden="true"></i>
					<span class="sr-only">actions</span>
				</button>
			{/if}
		</div>

		<div class="flex gap-2 text-xs text-neutral-200">
			<div class="border-r-2 pr-2">ID <span class="select-all">{method.token}</span></div>
			{#if method.expiration !== undefined}
				<div>Expires {method.expiration}</div>
			{/if}
		</div>
	{:else}
		<div class="flex items-start justify-between">
			<h4 class="mb-2 flex min-w-0 items-center gap-3">
				<i class="fa-solid fa-cc-paypal text-lg" aria-hidden="true"></i>
				<span class="sr-only">paypal account</span>
				<span class="min-w-0 truncate">{method.maskedEmail}</span>
			</h4>
			{#if !inUse}
				<button class="pl-4 pr-1" use:melt={$trigger}>
					<i class="fa-solid fa-ellipsis-vertical" aria-hidden="true"></i>
					<span class="sr-only">actions</span>
				</button>
			{/if}
		</div>

		<div class="text-xs text-neutral-200">
			ID <span class="select-all">{method.token}</span>
		</div>
	{/if}
</div>

<Dropdown {menu}>
	<DropdownItem {item} on:click={setMethodPrimary}>Set as primary</DropdownItem>
	<DropdownItem {item} on:click={deleteMethod}>Delete</DropdownItem>
</Dropdown>
