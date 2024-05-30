<script lang="ts">
	import SvelteSeo from 'svelte-seo';
	import BuildYourTier from './BuildYourTier.svelte';
	import { checkoutState } from '../../../stores';
	import Billing from './Billing.svelte';
	import Payment from './Payment.svelte';

	export let data;
	const email = data.email!;
</script>

<SvelteSeo title="Checkout | Raibu" />

<div class="relative flex w-full grow justify-center overflow-visible">
	<section class="ml-auto w-full max-w-3xl">
		<h2>Checkout</h2>
		<div class="grid w-full grid-cols-1 grid-rows-1">
			{#if $checkoutState.stage === 'BuildYourTier'}
				<BuildYourTier
					countries={data.countries}
					maxConcurrentUsersValue={$checkoutState.maxConcurrentUsersValue}
					maxConcurrentStreamsValue={$checkoutState.maxConcurrentStreamsValue}
					maxBitrateValue={$checkoutState.maxBitrateValue}
				/>
			{:else if $checkoutState.stage === 'Billing'}
				<Billing
					countries={data.countries}
					address={$checkoutState.address}
					tier={$checkoutState.tier}
				/>
			{:else if $checkoutState.stage === 'Payment'}
				<Payment
					tier={$checkoutState.tier}
					address={$checkoutState.address}
					{email}
					signupDate={data.signupDate}
					ip={data.ip}
				/>
			{/if}
		</div>
	</section>
	<section class="ml-auto min-w-4 overflow-visible border-l border-neutral-300 p-6">
		<h3>Order Summary</h3>
		<div class="sticky top-0">test</div>
	</section>
</div>
