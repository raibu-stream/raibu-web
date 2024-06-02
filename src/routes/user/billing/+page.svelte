<script lang="ts">
	import SvelteSeo from 'svelte-seo';
	import PaymentMethod from './PaymentMethod.svelte';
	import Subscription from './Subscription.svelte';

	export let data;
	let paymentMethods = data.paymentMethods;

	let hasSubscription = false;

	data.subscription.then((subscription) => {
		if (subscription !== undefined) {
			hasSubscription = true;
			paymentMethods = paymentMethods.filter(
				(method) => method.token !== subscription.paymentMethod.token
			);
		}
	});
</script>

<SvelteSeo title="Billing | Raibu" />

<div class="my-10 w-full max-w-section-breakout">
	<h2 class="text-left text-4xl font-bold tracking-tight">Billing</h2>
</div>

<div class="mb-6 flex max-w-5xl flex-col gap-6 md:flex-row">
	<section class="section flex-1 !pb-3 md:order-last">
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
				<Subscription {subscription} />
			{:else}
				<div class="flex w-full justify-center text-sm">
					<p>You aren't subscribed. <a href="/user/subscribe">Let's change that.</a></p>
				</div>
			{/if}
		{/await}
	</section>

	<section class="section flex-1">
		<div class="mb-6">
			<h3 class="mb-1 border-b-0 text-3xl font-bold tracking-tight">Payment Methods</h3>
			<small class="text-neutral-200">A list of payment methods connected to your account</small>
		</div>

		{#if paymentMethods.length !== 0}
			<ul>
				{#each paymentMethods as method (method.token)}
					<li class="w-full cursor-grab pb-4">
						<PaymentMethod {method} />
					</li>
				{/each}
			</ul>
		{:else if hasSubscription}
			<div class="flex w-full justify-center text-sm">
				<p>No additional payment methods are connected to your account</p>
			</div>
		{:else}
			<div class="flex w-full justify-center text-sm">
				<p>No payment methods are connected to your account</p>
			</div>
		{/if}
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
				{#each transactions as transaction}
					<li class="w-full border-b border-neutral-200 p-2 pb-4">
						<h4 class="mb-2 flex items-center justify-between gap-4 sm:justify-normal">
							<span>
								<span class="text-neutral-200">Transaction:</span>
								<span class="select-all font-semibold">{transaction.id}</span>
							</span>
							{#if transaction.status === 'authorizing' || transaction.status === 'settlement_pending' || transaction.status === 'settling' || transaction.status === 'submitted_for_settlement'}
								<div class="rounded-lg bg-pending p-1 text-xs text-neutral-900">
									{transaction.status.charAt(0).toUpperCase() +
										transaction.status.replace('_', ' ').slice(1)}
								</div>
							{:else if transaction.status === 'authorized' || transaction.status === 'settled' || transaction.status === 'settlement_confirmed'}
								<div class="rounded-lg bg-happy p-1 text-xs text-neutral-900">
									{transaction.status.charAt(0).toUpperCase() +
										transaction.status.replace('_', ' ').slice(1)}
								</div>
							{:else}
								<div class="rounded-lg bg-danger p-1 text-xs">
									{transaction.status.charAt(0).toUpperCase() +
										transaction.status.replace('_', ' ').slice(1)}
								</div>
							{/if}
						</h4>
						<div class="flex flex-col gap-2 text-sm sm:flex-row">
							<div class="flex flex-1 justify-between gap-4 sm:block sm:basis-40">
								{#if transaction.for !== undefined}
									<h5 class="mb-1 text-neutral-200">For</h5>
									<span
										>Service between {transaction.for.billingPeriodStartDate}-{transaction.for
											.billingPeriodEndDate}</span
									>
								{/if}
							</div>
							<div class="flex flex-1 justify-between gap-4 sm:block">
								<h5 class="mb-1 text-neutral-200">Amount</h5>
								<span>${transaction.amount}</span>
							</div>
							<div class="flex flex-1 justify-between gap-4 sm:block">
								<h5 class="mb-1 shrink-0 text-neutral-200">Paid at</h5>
								<span>{transaction.date}</span>
							</div>
						</div>
					</li>
				{/each}
			</ul>
		{:else}
			<div class="flex w-full justify-center text-sm">
				<p>No transactions yet</p>
			</div>
		{/if}
	{/await}
</section>

<style lang="postcss">
	.section {
		@apply w-full max-w-5xl bg-secondary-800 p-6 text-left shadow-lg section:rounded;
	}
</style>
