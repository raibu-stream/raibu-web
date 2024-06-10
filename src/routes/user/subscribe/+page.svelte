<script lang="ts">
	import SvelteSeo from 'svelte-seo';
	import BuildYourTier from './BuildYourTier.svelte';
	import { checkoutState } from '../../../stores';
	import Billing from './Billing.svelte';
	import Payment from '$lib/components/Payment.svelte';
	import { handleApiResponse } from '$lib/utils';
	import { goto } from '$app/navigation';
	import { toast } from 'svelte-sonner';
	import { fade } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';

	export let data;
</script>

<SvelteSeo title="Checkout | Raibu" />

<div class="relative flex h-full w-full grow justify-center overflow-visible">
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
				<div class="col-start-1 row-start-1" transition:fade={{ duration: 700, easing: quintOut }}>
					<h3>Payment</h3>
					<Payment
						tier={$checkoutState.tier}
						address={$checkoutState.address}
						email={data.email}
						signupDate={data.signupDate}
						ip={data.ip}
						subscribe={async (nonce) => {
							if ($checkoutState.stage === 'Payment') {
								const maybeErr = await handleApiResponse(
									await fetch('./subscribe', {
										method: 'post',
										body: JSON.stringify({
											tier: $checkoutState.tier,
											paymentMethodNonce: nonce
										})
									})
								);
								if (maybeErr === undefined) {
									goto(`/user`, { invalidateAll: true }).then(() =>
										toast.success(
											"Payment successful! You should have access to you tier now. If you don't, contact support."
										)
									);
								}

								return maybeErr;
							}
						}}
					/>
				</div>
			{/if}
		</div>
	</section>
	<section class="ml-auto min-w-4 overflow-visible border-l border-neutral-300 p-6">
		<h3>Order Summary</h3>
		<div class="sticky top-0">test</div>
	</section>
</div>
