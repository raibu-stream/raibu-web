<script lang="ts">
	import Dropdown from '$lib/components/Dropdown.svelte';
	import DropdownItem from '$lib/components/DropdownItem.svelte';
	import { createDropdownMenu, melt } from '@melt-ui/svelte';

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

	const {
		elements: { menu, item, trigger }
	} = createDropdownMenu();
</script>

<div class="w-full rounded bg-secondary-700 p-4 shadow-md">
	{#if !isPaypal(method)}
		<div class="flex items-start justify-between">
			<h4 class="mb-2 flex items-center gap-3">
				<i class="fa-solid fa-credit-card text-lg" aria-hidden="true"></i>
				<span class="sr-only">credit card</span>
				<span>{method.maskedNumber}</span>
			</h4>
			{#if !inUse}
				<button class="pl-4" use:melt={$trigger}>
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
			<h4 class="mb-2 flex items-center gap-3">
				<i class="fa-solid fa-cc-paypal text-lg" aria-hidden="true"></i>
				<span class="sr-only">paypal account</span>
				<span>{method.maskedEmail}</span>
			</h4>
			{#if !inUse}
				<button class="pl-4" use:melt={$trigger}>
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
	<DropdownItem {item}>Set as primary</DropdownItem>
	<DropdownItem {item}>Delete</DropdownItem>
</Dropdown>
