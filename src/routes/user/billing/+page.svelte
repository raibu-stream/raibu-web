<script lang="ts">
	import SvelteSeo from 'svelte-seo';
	import PaymentMethod from './PaymentMethod.svelte';
	import Subscription from './Subscription.svelte';
	import { melt } from '@melt-ui/svelte';
	import Modal from '$lib/components/Modal.svelte';
	import Payment from '$lib/components/Payment.svelte';
	import { draggable } from '$lib/draggable';
	import Pagination from '$lib/components/Pagination.svelte';
	import { writable } from 'svelte/store';
	import { formatter } from '$lib/tier';
	import Copyable from '$lib/components/Copyable.svelte';
	import { handleApiResponse } from '$lib/utils';

	export let data;

	let trigger: any;

	let currentInvoicesPage = writable(1);
	let currentMethodsPage = writable(1);
</script>

<SvelteSeo title="Billing | Raibu" />

<Modal
	titleString="Add a payment method"
	bind:trigger
	defaultOpen={data.failedPaymentIntent !== undefined}
	let:open
>
	<div class="flex justify-center">
		<Payment
			clientSecret={data.failedPaymentIntent !== undefined
				? data.failedPaymentIntent.clientSecret
				: async () => {
						return await fetch('/user/billing/payment-method', {
							method: 'post'
						}).then(async (res) => {
							let maybeError = await handleApiResponse(res);
							if (maybeError === undefined) {
								return { clientSecret: await res.json() };
							} else {
								return { error: maybeError };
							}
						});
					}}
			returnUrl="/user/billing"
			beforeNavigate={() => {
				open.set(false);
			}}
			type="setup"
			failed={data.failedPaymentIntent !== undefined}
		/>
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

		{#await Promise.all([data.subscription, data.paymentMethods])}
			<div class="flex w-full justify-center">
				<i class="fa-solid fa-circle-notch animate-spin" aria-hidden="true"></i>
				<span class="sr-only">Loading</span>
			</div>
		{:then [subscription, paymentMethods]}
			{#if subscription !== undefined}
				<Subscription {subscription} {paymentMethods} />
			{:else}
				<div class="flex w-full justify-center text-sm">
					<p>
						You aren't subscribed. <a href="/user/subscribe/byo" class="underline"
							>Let's change that.</a
						>
					</p>
				</div>
			{/if}
		{/await}
	</section>

	<section class="section">
		<div class="mb-6">
			<h3 class="mb-1 border-b-0 text-3xl font-bold tracking-tight">Payment Methods</h3>
			<small class="text-neutral-200">A list of payment methods connected to your account</small>
		</div>

		{#await data.paymentMethods}
			<div class="flex w-full justify-center">
				<i class="fa-solid fa-circle-notch animate-spin" aria-hidden="true"></i>
				<span class="sr-only">Loading</span>
			</div>
		{:then paymentMethods}
			<ul class="mb-4 flex flex-col gap-4">
				{#each paymentMethods.slice(3 * $currentMethodsPage - 3, 3 * $currentMethodsPage) as method (method.id)}
					{#await data.subscription}
						<li
							class="w-full"
							use:draggable={{
								indentifier: method.id,
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
						{#if subscription?.paymentMethod.id !== method.id}
							<li
								class="w-full"
								use:draggable={{
									indentifier: method.id,
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
		{/await}
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
	</section>
</div>

<section class="section mb-6">
	<div class="mb-6">
		<h3 class="mb-1 border-b-0 text-3xl font-bold tracking-tight">Transaction History</h3>
		<small class="text-neutral-200">A list of prior transactions on your account</small>
	</div>

	{#await data.invoices}
		<div class="flex w-full justify-center">
			<i class="fa-solid fa-circle-notch animate-spin" aria-hidden="true"></i>
			<span class="sr-only">Loading</span>
		</div>
	{:then invoices}
		{#if invoices.length !== 0}
			<ul>
				{#each invoices.slice(7 * $currentInvoicesPage - 7, 7 * $currentInvoicesPage) as invoice}
					<li
						class="flex w-full items-center justify-between gap-4 border-b border-neutral-200 p-2 pb-4 sm:justify-normal"
					>
						<div class="flex flex-col gap-6 whitespace-nowrap text-sm sm:flex-row">
							<div class="flex flex-1 justify-between gap-4 sm:block">
								<div class="mb-1 text-neutral-200">ID</div>
								<div class="flex gap-2">
									<Copyable>
										<div class="max-w-36 truncate">{invoice.id}</div>
									</Copyable>
								</div>
							</div>
							<div class="flex flex-1 justify-between gap-4 sm:block">
								<div class="mb-1 text-neutral-200">Amount</div>
								<span>{formatter.format(invoice.amount / 100)}</span>
							</div>
							<div class="flex flex-1 justify-between gap-4 sm:block">
								<div class="mb-1 shrink-0 text-neutral-200">Paid at</div>
								<span>{invoice.date.toLocaleDateString()}</span>
							</div>
						</div>
					</li>
				{/each}
			</ul>
			<div class="mt-3 flex">
				<div class="ml-auto">
					<Pagination total={invoices.length} perPage={7} currentPage={currentInvoicesPage} />
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
