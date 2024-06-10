<script lang="ts">
	import StreetAddressForm from '$lib/components/StreetAddressForm.svelte';
	import type { Country } from '@shopify/address';
	import { checkoutState, type BillingState } from '../../../stores';
	import { fade } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';
	import type { Tier } from '$lib/tier';
	import { handleApiResponse } from '$lib/utils';
	import { z } from 'zod';
	import { address as zAddress } from '$lib/utils';
	import FormError from '$lib/components/FormError.svelte';

	export let countries: Country[];
	export let address: BillingState['address'];
	export let tier: Tier;

	let apiError: undefined | string;
	let createCustomerRequest: Promise<unknown> | undefined;

	let getAddress: () => z.infer<ReturnType<typeof zAddress>> | undefined;
	const onSubmit = () => {
		apiError = undefined;
		const maybeAddress = getAddress();
		if (maybeAddress === undefined) {
			return;
		}

		createCustomerRequest = fetch('./customer', {
			method: 'post',
			body: JSON.stringify(maybeAddress)
		})
			.then(handleApiResponse)
			.then((res) => {
				if (res !== undefined) {
					apiError = res;
				} else {
					checkoutState.set({ stage: 'Payment', tier, address: maybeAddress });
				}
			});
	};
</script>

<div class="col-start-1 row-start-1" transition:fade={{ duration: 700, easing: quintOut }}>
	<h3>Billing</h3>

	<form on:submit|preventDefault={onSubmit} novalidate class="w-full max-w-2xl px-2 text-left">
		<StreetAddressForm {countries} addressSaved={address} bind:getAddress />
		<button class="button">
			{#await createCustomerRequest}
				<i class="fa-solid fa-circle-notch animate-spin" aria-hidden="true"></i>
				<span class="sr-only">Loading</span>
				<!-- eslint-disable-next-line @typescript-eslint/no-unused-vars -->
			{:then _}
				Confirm
			{/await}
		</button>

		{#if apiError !== undefined}
			<FormError class="mt-2">{apiError}</FormError>
		{/if}
	</form>
</div>
