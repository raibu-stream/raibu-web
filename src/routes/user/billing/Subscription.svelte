<script lang="ts">
	import { getPreset, type Tier } from '$lib/tier';
	import { createDropdownMenu, melt } from '@melt-ui/svelte';
	import PaymentMethod from './PaymentMethod.svelte';
	import Dropdown from '$lib/components/Dropdown.svelte';
	import DropdownItem from '$lib/components/DropdownItem.svelte';

	export let subscription: {
		token: string;
		status: 'Active' | 'Canceled' | 'Expired' | 'Past Due' | 'Pending';
		paymentMethod:
			| {
					token: string;
					maskedEmail: string;
					maskedNumber?: undefined;
					expiration?: undefined;
			  }
			| {
					token: string;
					maskedNumber: string;
					expiration: string | undefined;
					maskedEmail?: undefined;
			  };
		balance: string;
		nextBillAmount: string;
		nextBillingDate: string;
		tier: Tier;
	};

	const {
		elements: { menu, item, trigger }
	} = createDropdownMenu();
</script>

<div>
	<div class="mb-4">
		<div class="flex items-center justify-between">
			<h4 class="flex items-center gap-4 text-lg">
				<span>
					{#if getPreset(subscription.tier) !== undefined}
						{getPreset(subscription.tier)}
					{:else}
						Custom tier
					{/if}
				</span>
				{#if subscription.status === 'Pending' || subscription.status === 'Past Due'}
					<div class="rounded-lg bg-pending p-1 text-xs text-neutral-900">
						{subscription.status}
					</div>
				{:else if subscription.status === 'Active'}
					<div class="rounded-lg bg-happy p-1 text-xs text-neutral-900">
						{subscription.status}
					</div>
				{:else}
					<div class=" rounded-lg bg-danger p-1 text-xs">
						{subscription.status}
					</div>
				{/if}
			</h4>
			<button class="pl-4" use:melt={$trigger}>
				<i class="fa-solid fa-ellipsis-vertical" aria-hidden="true"></i>
				<span class="sr-only">actions</span>
			</button>
		</div>
		<small class="text-neutral-200">
			{subscription.tier.maxConcurrentStreams} streams with {subscription.tier.maxConcurrentViewers}
			viewers @ {subscription.tier.maxBitrateInKbps} kbps
		</small>
	</div>
	<PaymentMethod method={subscription.paymentMethod} inUse />
	<small class="mt-3 block text-xs text-neutral-200">
		ID: <span class="select-all">{subscription.token}</span>
	</small>
</div>

<Dropdown {menu}>
	<DropdownItem {item}>Edit</DropdownItem>
	<DropdownItem {item}>Cancel</DropdownItem>
</Dropdown>
