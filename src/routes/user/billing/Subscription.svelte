<script lang="ts">
	import { getPreset } from '$lib/tier';
	import { createDropdownMenu, melt } from '@melt-ui/svelte';
	import PaymentMethod from './PaymentMethod.svelte';
	import Dropdown from '$lib/components/Dropdown.svelte';
	import DropdownItem from '$lib/components/DropdownItem.svelte';
	import { dropzone } from '$lib/draggable';
	import { handleApiResponse } from '$lib/utils';
	import { invalidateAll } from '$app/navigation';
	import { toast } from 'svelte-sonner';
	import Modal from '$lib/components/Modal.svelte';
	import { writable } from 'svelte/store';
	import type { PageData } from './$types';
	import Copyable from '$lib/components/Copyable.svelte';

	type PaymentMethods = Awaited<PageData['paymentMethods']>;
	type PaymentMethod = Awaited<PageData['paymentMethods']>[0];

	export let subscription: NonNullable<Awaited<PageData['subscription']>>;
	export let paymentMethods: PaymentMethods;

	let consideringMethod: undefined | PaymentMethod;
	let isConfirmationModalOpen = writable(false);
	let confirmationModalState: { token: string; node: HTMLElement } | undefined;
	let changePaymentMethodRequestIsOngoing = false;

	$: if (
		!changePaymentMethodRequestIsOngoing &&
		confirmationModalState !== undefined &&
		!$isConfirmationModalOpen
	) {
		confirmationModalState.node.style.visibility = '';
	}

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
				{#if subscription.status === 'past_due' || subscription.status === 'paused' || subscription.status === 'incomplete' || subscription.status === 'unpaid'}
					<div class="rounded-lg bg-pending p-1 text-xs capitalize text-neutral-900">
						{subscription.status.replaceAll('_', ' ')}
					</div>
				{:else if subscription.status === 'active' || subscription.status === 'trialing'}
					<div class="rounded-lg bg-happy p-1 text-xs capitalize text-neutral-900">
						{subscription.status.replaceAll('_', ' ')}
					</div>
				{:else}
					<div class="rounded-lg bg-danger p-1 text-xs capitalize text-neutral-900">
						{subscription.status.replaceAll('_', ' ')}
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
	<div
		id="primary-payment-method"
		class="relative"
		class:opacity-50={consideringMethod !== undefined}
		class:outline={consideringMethod !== undefined}
		use:dropzone={{
			onDrop: (token, node) => {
				node.style.visibility = 'invisible';
				confirmationModalState = {
					token,
					node
				};
				isConfirmationModalOpen.set(true);
			},
			onConsider: (token) => {
				const maybePaymentMethod = paymentMethods.find((method) => method.id === token);
				if (maybePaymentMethod !== undefined) {
					consideringMethod = maybePaymentMethod;
				}
			},
			onUnconsider: () => {
				consideringMethod = undefined;
			},
			type: 'payment methods',
			selector: '#primary-payment-method'
		}}
	>
		{#if (changePaymentMethodRequestIsOngoing || $isConfirmationModalOpen) && confirmationModalState !== undefined}
			<div class="absolute -inset-2 flex items-center justify-center bg-neutral-800/50">
				<i class="fa-solid fa-circle-notch animate-spin" aria-hidden="true"></i>
				<span class="sr-only">Loading</span>
			</div>
		{/if}
		<PaymentMethod method={consideringMethod ?? subscription.paymentMethod} inUse />
	</div>
	<small class="mt-3 flex gap-2 text-xs text-neutral-200">
		ID:
		<Copyable>
			<div class="max-w-24 truncate">{subscription.token}</div>
		</Copyable>
	</small>
</div>

<Dropdown {menu}>
	<DropdownItem {item}>Edit</DropdownItem>
	<DropdownItem {item}>Cancel</DropdownItem>
</Dropdown>

<Modal
	titleString="Use this payment method for your subscription?"
	type="alertdialog"
	isOpen={isConfirmationModalOpen}
	let:close
	let:description
>
	<p class="mb-8" use:melt={description}>
		This payment method will be charged on the next billing cycle instead of the current one.
	</p>
	<div class="flex justify-end gap-3">
		<button
			class="button"
			use:melt={close}
			on:m-click={() => {
				if (confirmationModalState === undefined) return;
				changePaymentMethodRequestIsOngoing = true;

				fetch('./subscribe', {
					method: 'PATCH',
					body: JSON.stringify({ paymentMethodToken: confirmationModalState.token })
				})
					.then((res) => {
						return handleApiResponse(res, async () => {
							await invalidateAll();
						});
					})
					.then((res) => {
						changePaymentMethodRequestIsOngoing = false;

						if (res !== undefined) {
							toast.error(res);
						}
					})
					.catch(() => {
						changePaymentMethodRequestIsOngoing = false;
					});
			}}
		>
			Confirm
		</button>
		<button class="button button-invert" use:melt={close}> Cancel </button>
	</div>
</Modal>
