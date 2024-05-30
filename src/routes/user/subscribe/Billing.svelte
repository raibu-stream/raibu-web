<script lang="ts">
	import StreetAddressForm from '$lib/components/StreetAddressForm.svelte';
	import type { Country } from '@shopify/address';
	import { checkoutState, type BillingState } from '../../../stores';
	import { fade } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';
	import type { Tier } from '$lib/tier';

	export let countries: Country[];
	export let address: BillingState['address'];
	export let tier: Tier;

	let getAddress: () => any | undefined;
	const onSubmit = () => {
		const maybeAddress = getAddress();
		if (maybeAddress === undefined) {
			return;
		}

		checkoutState.set({ stage: 'Payment', tier, address: maybeAddress });
	};
</script>

<div class="col-start-1 row-start-1" transition:fade={{ duration: 700, easing: quintOut }}>
	<h3>Billing</h3>

	<form on:submit|preventDefault={onSubmit} novalidate class="w-full max-w-2xl px-2 text-left">
		<StreetAddressForm {countries} addressSaved={address} bind:getAddress />
		<button class="button">Continue</button>
	</form>
</div>
