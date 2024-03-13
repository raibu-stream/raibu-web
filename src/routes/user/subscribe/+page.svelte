<script lang="ts">
	import TickedSlider from '$lib/components/TickedSlider.svelte';
	import RadioGroup from '$lib/components/RadioGroup.svelte';
	import RadioButton from '$lib/components/RadioButton.svelte';
	import StreetAddressForm from '$lib/components/StreetAddressForm.svelte';

	export let data;

	let sliderValue: number;
</script>

<div class="relative flex w-full grow justify-center overflow-visible">
	<section class="ml-auto">
		<h2>Checkout</h2>
		<h3>Build Your Tier</h3>

		<StreetAddressForm countries={data.countries} />
		<TickedSlider
			ticks={[80, 125, 200, 300, 500, 600, 800]}
			bind:value={sliderValue}
			class="mb-8 max-w-xl"
		/>
		<TickedSlider ticks={[1, 2, 3, 4, 5, 6]} bind:value={sliderValue} class="mb-8 max-w-xl" />
		<RadioGroup defaultValue="3000 Kbps" ariaLabel="Bitrate" let:isChecked let:item>
			<RadioButton {isChecked} {item} value="3000 Kbps"></RadioButton>
			<RadioButton {isChecked} {item} value="6000 Kbps"></RadioButton>
			<RadioButton {isChecked} {item} value="8000 Kbps"></RadioButton>
		</RadioGroup>
	</section>
	<section class="ml-auto min-w-4 overflow-visible border-l border-neutral-300 p-6">
		<h3>Order Summary</h3>
		<div class="sticky top-0">test</div>
	</section>
</div>
