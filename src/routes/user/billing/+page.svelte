<script lang="ts">
	import SvelteSeo from 'svelte-seo';
	import PaymentMethod from './PaymentMethod.svelte';
	import Subscription from './Subscription.svelte';
	import { melt } from '@melt-ui/svelte';
	import Modal from '$lib/components/Modal.svelte';
	import Payment from '$lib/components/Payment.svelte';
	import { handleApiResponse } from '$lib/utils';
	import { invalidateAll } from '$app/navigation';
	import { draggable } from '$lib/draggable';
	import Pagination from '$lib/components/Pagination.svelte';
	import { writable } from 'svelte/store';

	export let data;

	let trigger: any;

	let currentTransactionsPage = writable(1);
	let currentMethodsPage = writable(1);
</script>

<SvelteSeo title="Billing | Raibu" />

<Modal titleString="Add a payment method" bind:trigger let:open>
	<div class="flex justify-center">
		<div>
			<Payment
				address={data.address}
				email={data.email}
				signupDate={data.signupDate}
				ip={data.ip}
				subscribe={async (nonce) => {
					const maybeErr = await handleApiResponse(
						await fetch('./billing/payment-method', {
							method: 'post',
							body: JSON.stringify({
								paymentMethodNonce: nonce
							})
						})
					);

					if (maybeErr === undefined) {
						invalidateAll();
						open.set(false);
					}

					return maybeErr;
				}}
			/>
		</div>
	</div>
</Modal>

<div class="my-10 w-full max-w-section-breakout">
	<h2 class="text-left text-4xl font-bold tracking-tight">Billing</h2>
</div>

<div class="mb-6 grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-2">
	<section class="section md:order-last">
		<div class="mb-6">
			<h3 class="mb-1 border-b-0 text-3xl font-bold tracking-tight">Subscription</h3>
			<small class="text-neutral-200">The currently active subscription on your account</small>
		</div>

		{#await data.subscription}
			<div class="flex w-full justify-center">
				<i class="fa-solid fa-circle-notch animate-spin" aria-hidden="true"></i>
				<span class="sr-only">Loading</span>
			</div>
		{:then subscription}
			{#if subscription !== undefined}
				<Subscription {subscription} paymentMethods={data.paymentMethods} />
			{:else}
				<div class="flex w-full justify-center text-sm">
					<p>You aren't subscribed. <a href="/user/subscribe">Let's change that.</a></p>
				</div>
			{/if}
		{/await}
	</section>

	<section class="section">
		<div class="mb-6">
			<h3 class="mb-1 border-b-0 text-3xl font-bold tracking-tight">Payment Methods</h3>
			<small class="text-neutral-200">A list of payment methods connected to your account</small>
		</div>

		<ul class="mb-4 flex flex-col gap-4">
			{#each data.paymentMethods.slice(3 * $currentMethodsPage - 3, 3 * $currentMethodsPage) as method (method.token)}
				{#await data.subscription}
					<li
						class="w-full"
						use:draggable={{
							indentifier: method.token,
							type: 'payment methods',
							onDragStart: (node) => {
								node.style.zIndex = '30';
							},
							onDragSettle: (node) => {
								node.style.zIndex = '';
							}
						}}
					>
						<PaymentMethod {method} />
					</li>
				{:then subscription}
					{#if subscription?.paymentMethod?.token !== method.token}
						<li
							class="w-full"
							use:draggable={{
								indentifier: method.token,
								type: 'payment methods',
								onDragStart: (node) => {
									node.style.zIndex = '30';
								},
								onDragSuccessfulDrop: (node) => {
									node.style.visibility = 'hidden';
								},
								onDragSettle: (node) => {
									node.style.zIndex = '';
								}
							}}
						>
							<PaymentMethod {method} />
						</li>
					{/if}
				{/await}
			{/each}
		</ul>
		{#if trigger}
			<button
				class="group relative mb-4 flex h-20 w-full items-center justify-center rounded-[12px]"
				use:melt={$trigger}
			>
				<svg
					width="100%"
					height="100%"
					xmlns="http://www.w3.org/2000/svg"
					class="absolute inset-0 overflow-visible text-neutral-200 transition-colors group-hover:text-neutral-100"
				>
					<rect
						width="100%"
						height="100%"
						fill="none"
						rx="12"
						ry="12"
						stroke="currentcolor"
						stroke-width="2"
						stroke-dasharray="8,18"
						stroke-linecap="square"
						vector-effect="non-scaling-stroke"
					/>
				</svg>

				<p>
					<i class="fa-solid fa-plus" aria-hidden="true"></i>
					Add method
				</p>
			</button>
		{/if}
		{#await data.subscription}
			<div class="mt-3 flex">
				<div class="ml-auto">
					<Pagination
						total={data.paymentMethods.length}
						perPage={3}
						currentPage={currentMethodsPage}
					/>
				</div>
			</div>
		{:then subscription}
			{@const foundMethod = data.paymentMethods.find(
				(method) => subscription?.paymentMethod.token === method.token
			)}
			{@const total =
				foundMethod === undefined ? data.paymentMethods.length : data.paymentMethods.length - 1}
			{#if total !== 0}
				<div class="mt-3 flex">
					<div class="ml-auto">
						<Pagination {total} perPage={3} currentPage={currentMethodsPage} />
					</div>
				</div>
			{/if}
		{/await}
	</section>
</div>

<section class="section mb-6">
	<div class="mb-6">
		<h3 class="mb-1 border-b-0 text-3xl font-bold tracking-tight">Transaction History</h3>
		<small class="text-neutral-200">A list of prior transactions on your account</small>
	</div>

	{#await data.transactions}
		<div class="flex w-full justify-center">
			<i class="fa-solid fa-circle-notch animate-spin" aria-hidden="true"></i>
			<span class="sr-only">Loading</span>
		</div>
	{:then transactions}
		{#if transactions.length !== 0}
			<ul>
				<span>please dear god get a designer to fix this</span>
				{#each transactions.slice(7 * $currentTransactionsPage - 7, 7 * $currentTransactionsPage) as transaction}
					<li class="w-full border-b border-neutral-200 p-2 pb-4">
						<h4 class="mb-2 flex items-center justify-between gap-4 sm:justify-normal">
							<span>
								<span class="text-neutral-200">Transaction:</span>
								<span class="select-all font-semibold">{transaction.id}</span>
							</span>
							{#if transaction.status === 'authorizing' || transaction.status === 'settlement_pending' || transaction.status === 'settling' || transaction.status === 'submitted_for_settlement'}
								<div class="rounded-lg bg-pending p-1 text-xs text-neutral-900">
									{transaction.status.charAt(0).toUpperCase() +
										transaction.status.replaceAll('_', ' ').slice(1)}
								</div>
							{:else if transaction.status === 'authorized' || transaction.status === 'settled' || transaction.status === 'settlement_confirmed'}
								<div class="rounded-lg bg-happy p-1 text-xs text-neutral-900">
									{transaction.status.charAt(0).toUpperCase() +
										transaction.status.replaceAll('_', ' ').slice(1)}
								</div>
							{:else}
								<div class="rounded-lg bg-danger p-1 text-xs">
									{transaction.status.charAt(0).toUpperCase() +
										transaction.status.replaceAll('_', ' ').slice(1)}
								</div>
							{/if}
						</h4>
						<div class="flex flex-col gap-2 text-sm sm:flex-row">
							<div class="flex flex-1 justify-between gap-4 sm:block sm:basis-40">
								{#if transaction.for !== undefined}
									<h5 class="mb-1 text-neutral-200">For</h5>
									<span
										>Service between {new Date(
											transaction.for.billingPeriodStartDate
										).toLocaleDateString()} and
										{new Date(transaction.for.billingPeriodEndDate).toLocaleDateString()}</span
									>
								{/if}
							</div>
							<div class="flex flex-1 justify-between gap-4 sm:block">
								<h5 class="mb-1 text-neutral-200">Amount</h5>
								<span>${transaction.amount}</span>
							</div>
							<div class="flex flex-1 justify-between gap-4 sm:block">
								<h5 class="mb-1 shrink-0 text-neutral-200">Paid at</h5>
								<span>{new Date(transaction.date).toLocaleDateString()}</span>
							</div>
						</div>
					</li>
				{/each}
			</ul>
			<div class="mt-3 flex">
				<div class="ml-auto">
					<Pagination
						total={transactions.length}
						perPage={7}
						currentPage={currentTransactionsPage}
					/>
				</div>
			</div>
		{:else}
			<div class="flex w-full justify-center text-sm">
				<p>No transactions yet</p>
			</div>
		{/if}
	{/await}
</section>

<style lang="postcss">
	.section {
		@apply w-full max-w-5xl bg-secondary-800 p-6 pb-3 text-left shadow-lg section:rounded;
	}
</style>
