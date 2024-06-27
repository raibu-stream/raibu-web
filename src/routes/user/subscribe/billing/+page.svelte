<script lang="ts">
	import StreetAddressForm from '$lib/components/StreetAddressForm.svelte';
	import { fade } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';
	import { tierToQueryParameters } from '$lib/tier';
	import { handleApiResponse } from '$lib/utils';
	import { z } from 'zod';
	import { address as zAddress } from '$lib/utils';
	import FormError from '$lib/components/FormError.svelte';
	import { goto } from '$app/navigation';
	import SvelteSeo from 'svelte-seo';

	export let data;

	let apiError: undefined | string;
	let createCustomerRequest: Promise<unknown> | undefined;

	let getAddress: () => z.infer<ReturnType<typeof zAddress>> | undefined;
	const onSubmit = () => {
		apiError = undefined;
		const maybeAddress = getAddress();
		if (maybeAddress === undefined) {
			return;
		}

		createCustomerRequest = fetch('/user/customer', {
			method: 'post',
			body: JSON.stringify(maybeAddress)
		})
			.then(handleApiResponse)
			.then(async (res) => {
				if (res !== undefined) {
					apiError = res;
				} else {
					await goto(`/user/subscribe/payment?${tierToQueryParameters(data.tier)}`);
				}
			});
	};
</script>

<SvelteSeo title="Billing | Raibu" />

<div class="col-start-1 row-start-1" transition:fade={{ duration: 700, easing: quintOut }}>
	<h3>Billing</h3>

	<form on:submit|preventDefault={onSubmit} novalidate class="w-full max-w-2xl px-2 text-left">
		<StreetAddressForm countries={data.countries} bind:getAddress />
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
