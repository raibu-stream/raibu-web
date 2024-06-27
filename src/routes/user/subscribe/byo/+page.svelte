<script lang="ts">
	import RadioButton from '$lib/components/RadioButton.svelte';
	import RadioGroup from '$lib/components/RadioGroup.svelte';
	import TickedSlider from '$lib/components/TickedSlider.svelte';
	import { get, writable } from 'svelte/store';
	import { fade } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';
	import { goto } from '$app/navigation';
	import { tierToQueryParameters, tierFromIndexs } from '$lib/tier.js';
	import SvelteSeo from 'svelte-seo';

	let maxConcurrentViewersValue = writable([0]);
	let maxConcurrentStreamsValue = writable([0]);
	let maxBitrateValue = writable('3000 Kbps');
	let request: undefined | Promise<unknown>;

	export const snapshot = {
		capture: () => {
			return {
				maxConcurrentViewersValue: get(maxConcurrentViewersValue),
				maxConcurrentStreamsValue: get(maxConcurrentStreamsValue),
				maxBitrateValue: get(maxBitrateValue)
			};
		},
		restore: (value) => {
			maxConcurrentViewersValue.set(value.maxConcurrentViewersValue);
			maxConcurrentStreamsValue.set(value.maxConcurrentStreamsValue);
			maxBitrateValue.set(value.maxBitrateValue);
		}
	};

	const onSubmit = async () => {
		request = goto(
			`/user/subscribe/billing?${tierToQueryParameters(
				tierFromIndexs(
					$maxConcurrentViewersValue[0],
					$maxConcurrentStreamsValue[0],
					$maxBitrateValue === '3000 Kbps'
						? 0
						: $maxBitrateValue === '6000 Kbps'
							? 1
							: $maxBitrateValue === '8000 Kbps'
								? 2
								: NaN
				)
			)}`
		);
	};
</script>

<SvelteSeo title="Build Your Tier | Raibu" />

<div class="col-start-1 row-start-1" transition:fade={{ duration: 700, easing: quintOut }}>
	<h3>Build Your Tier</h3>

	<form on:submit|preventDefault={onSubmit} novalidate>
		<TickedSlider
			ticks={[80, 125, 200, 300, 500, 800]}
			value={maxConcurrentViewersValue}
			class="mb-8 max-w-xl"
		/>
		<TickedSlider ticks={[1, 2, 3, 6]} value={maxConcurrentStreamsValue} class="mb-8 max-w-xl" />
		<RadioGroup value={maxBitrateValue} ariaLabel="Bitrate" let:isChecked let:item>
			<RadioButton {isChecked} {item} value="3000 Kbps"></RadioButton>
			<RadioButton {isChecked} {item} value="6000 Kbps"></RadioButton>
			<RadioButton {isChecked} {item} value="8000 Kbps"></RadioButton>
		</RadioGroup>

		<button class="button mt-4" type="submit">
			{#await request}
				<i class="fa-solid fa-circle-notch animate-spin" aria-hidden="true"></i>
				<span class="sr-only">Loading</span>
				<!-- eslint-disable-next-line @typescript-eslint/no-unused-vars -->
			{:then _}
				Continue
			{/await}</button
		>
	</form>
</div>
