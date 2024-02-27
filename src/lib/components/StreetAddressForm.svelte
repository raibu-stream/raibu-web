<script lang="ts">
	import { address, meltLabel } from '$lib/utils';
	import { melt } from '@melt-ui/svelte';
	import Select from './Select.svelte';
	import SelectOption from './SelectOption.svelte';
	import { type Country, buildOrderedFields } from '@shopify/address';
	import { writable } from 'svelte/store';
	import FormError from './FormError.svelte';
	import { slide } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';
	import { onMount } from 'svelte';

	export let countries: Country[];
	let country = writable({
		value: countries.find((country) => country.code === 'US')!,
		label: 'United States'
	});
	$: layout = buildOrderedFields($country.value)
		.map((line) =>
			line.filter((field) => field !== 'phone' && field !== 'company' && field !== 'country')
		)
		.filter((line) => line.length !== 0);

	let firstName = '';
	let firstNameError: string | undefined = undefined;
	let lastName = '';
	let lastNameError: string | undefined = undefined;
	let city = '';
	let cityError: string | undefined = undefined;
	let postalCode = '';
	let postalCodeError: string | undefined = undefined;
	let zone = writable({
		value: ''
	});
	let zoneError: string | undefined = undefined;
	let address1 = '';
	let address1Error: string | undefined = undefined;
	let address2 = '';
	let address2Error: string | undefined = undefined;

	const onSubmit = () => {
		firstNameError = undefined;
		lastNameError = undefined;
		cityError = undefined;
		postalCodeError = undefined;
		zoneError = undefined;
		address1Error = undefined;
		address2Error = undefined;

		let result = address(countries).safeParse({
			firstName,
			lastName,
			country: $country.value.code,
			address1,
			address2: address2 === '' ? undefined : address2,
			city: city === '' || !$country.value.formatting.edit.includes('{city}') ? undefined : city,
			zone:
				$zone.value === '' || !$country.value.formatting.edit.includes('{province}')
					? undefined
					: $zone.value,
			postalCode:
				postalCode === '' || !$country.value.formatting.edit.includes('{zip}')
					? undefined
					: postalCode
		});
		if (!result.success) {
			let errors = result.error.flatten().fieldErrors;

			firstNameError = errors.firstName === undefined ? errors.firstName : errors.firstName[0];
			lastNameError = errors.lastName === undefined ? errors.lastName : errors.lastName[0];
			cityError = errors.city === undefined ? errors.city : errors.city[0];
			postalCodeError = errors.postalCode === undefined ? errors.postalCode : errors.postalCode[0];
			zoneError = errors.zone === undefined ? errors.zone : errors.zone[0];
			address1Error = errors.address1 === undefined ? errors.address1 : errors.address1[0];
			address2Error = errors.address2 === undefined ? errors.address2 : errors.address2[0];

			return;
		}
		console.log(result.data);
	};

	onMount(() =>
		country.subscribe(() => {
			zone.set({
				value: ''
			});
		})
	);
</script>

<form on:submit|preventDefault={onSubmit} novalidate class="w-full max-w-2xl px-2 text-left">
	<Select
		class="mb-4 w-full max-w-none"
		inputLabel={$country.value.labels.country}
		required
		placeholder="Select a country"
		selected={country}
		let:option
		let:isSelected
	>
		{#each countries as country}
			<SelectOption {option} {isSelected} label={country.name} value={country} />
		{/each}
	</Select>

	{#each layout as line}
		<div
			class="flex w-full flex-col gap-4 sm:flex-row"
			transition:slide={{ duration: 250, easing: quintOut }}
		>
			{#each line as field}
				<div
					class="min-w-0 flex-1"
					transition:slide={{ axis: 'x', duration: 250, easing: quintOut }}
				>
					{#if field === 'firstName'}
						<label for="first-name" class="whitespace-nowrap" use:melt={$meltLabel}>
							{$country.value.labels.firstName}
						</label>
						<div class="mb-4 mt-2 w-full">
							<input
								class="input w-full max-w-none"
								required
								id="first-name"
								autocomplete="billing given-name"
								bind:value={firstName}
							/>
							{#if firstNameError !== undefined}
								<FormError class="mt-2">{firstNameError}</FormError>
							{/if}
						</div>
					{:else if field === 'lastName'}
						<label for="last-name" class="whitespace-nowrap" use:melt={$meltLabel}>
							{$country.value.labels.lastName}
						</label>
						<div class="mb-4 mt-2 w-full">
							<input
								class="input w-full max-w-none"
								required
								id="last-name"
								autocomplete="billing family-name"
								bind:value={lastName}
							/>
							{#if lastNameError !== undefined}
								<FormError class="mt-2">{lastNameError}</FormError>
							{/if}
						</div>
					{:else if field === 'city'}
						<label for="city" class="whitespace-nowrap" use:melt={$meltLabel}>
							{$country.value.labels.city}
						</label>
						<div class="mb-4 mt-2 w-full">
							<input
								class="input w-full max-w-none"
								required
								id="city"
								autocomplete="billing address-level2"
								bind:value={city}
							/>
							{#if cityError !== undefined}
								<FormError class="mt-2">{cityError}</FormError>
							{/if}
						</div>
					{:else if field === 'zip'}
						<label for="postal-code" class="whitespace-nowrap" use:melt={$meltLabel}>
							{$country.value.labels.postalCode}
						</label>
						<div class="mb-4 mt-2 w-full">
							<input
								class="input w-full max-w-none"
								required
								id="postal-code"
								autocomplete="billing postal-code"
								bind:value={postalCode}
							/>
							{#if postalCodeError !== undefined}
								<FormError class="mt-2">{postalCodeError}</FormError>
							{/if}
						</div>
					{:else if field === 'province'}
						<Select
							class="mb-2 w-full max-w-none"
							inputLabel={$country.value.labels.zone}
							selected={zone}
							required
							placeholder="Select 
								{'aeiou'.includes($country.value.labels.zone[0].toLocaleLowerCase()) ? 'an' : 'a'} 
								{$country.value.labels.zone.toLocaleLowerCase()}"
							let:option
							let:isSelected
						>
							{#each $country.value.zones as zone}
								<SelectOption {option} {isSelected} label={zone.name} value={zone.code} />
							{/each}
						</Select>
						{#if zoneError !== undefined}
							<FormError class="mt-2">{zoneError}</FormError>
						{/if}
					{:else if field === 'address1'}
						<label for="address1" class="whitespace-nowrap" use:melt={$meltLabel}>
							{$country.value.labels.address1}
						</label>
						<div class="mb-4 mt-2 w-full">
							<input
								class="input w-full max-w-none"
								required
								id="address1"
								autocomplete="billing address-line1"
								bind:value={address1}
							/>
							{#if address1Error !== undefined}
								<FormError class="mt-2">{address1Error}</FormError>
							{/if}
						</div>
					{:else if field === 'address2'}
						<label for="address2" class="whitespace-nowrap" use:melt={$meltLabel}>
							{$country.value.optionalLabels.address2}
						</label>
						<div class="mb-4 mt-2 w-full">
							<input
								class="input w-full max-w-none"
								id="address2"
								autocomplete="billing address-line2"
								bind:value={address2}
							/>
							{#if address2Error !== undefined}
								<FormError class="mt-2">{address2Error}</FormError>
							{/if}
						</div>
					{/if}
				</div>
			{/each}
		</div>
	{/each}
	<button>cool</button>
</form>
