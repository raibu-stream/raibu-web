<script lang="ts">
	import RadioButton from '$lib/components/RadioButton.svelte';
	import RadioGroup from '$lib/components/RadioGroup.svelte';
	import TickedSlider from '$lib/components/TickedSlider.svelte';
	import { writable, type Writable } from 'svelte/store';
	import { checkoutState } from '../../../stores';
	import type { Country } from '@shopify/address';
	import { fade } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';
	import { getPricing, tierFromIndexs } from '$lib/tier';

	export let countries: Country[];

	export let maxConcurrentUsersValue: Writable<[number]>;
	export let maxConcurrentStreamsValue: Writable<[number]>;
	export let maxBitrateValue: Writable<string>;

	const onSubmit = () => {
		checkoutState.set({
			stage: 'Billing',
			address: writable({
				country: writable({
					value: countries.find((country) => country.code === 'US')!,
					label: 'United States'
				}),
				firstName: '',
				lastName: '',
				city: '',
				postalCode: '',
				zone: writable({ value: '' }),
				address1: '',
				address2: ''
			}),
			tier: tierFromIndexs(
				$maxConcurrentStreamsValue[0],
				$maxConcurrentUsersValue[0],
				$maxBitrateValue === '3000 Kbps'
					? 0
					: $maxBitrateValue === '6000 Kbps'
						? 1
						: $maxBitrateValue === '8000 Kbps'
							? 2
							: NaN
			)
		});
	};
</script>

<div class="col-start-1 row-start-1" transition:fade={{ duration: 700, easing: quintOut }}>
	<h3>Build Your Tier</h3>

	<form on:submit|preventDefault={onSubmit} novalidate>
		<TickedSlider
			ticks={[80, 125, 200, 300, 500, 800]}
			value={maxConcurrentUsersValue}
			class="mb-8 max-w-xl"
		/>
		<TickedSlider ticks={[1, 2, 3, 6]} value={maxConcurrentStreamsValue} class="mb-8 max-w-xl" />
		<RadioGroup value={maxBitrateValue} ariaLabel="Bitrate" let:isChecked let:item>
			<RadioButton {isChecked} {item} value="3000 Kbps"></RadioButton>
			<RadioButton {isChecked} {item} value="6000 Kbps"></RadioButton>
			<RadioButton {isChecked} {item} value="8000 Kbps"></RadioButton>
		</RadioGroup>

		<button class="button mt-4">Continue</button>
	</form>
</div>
