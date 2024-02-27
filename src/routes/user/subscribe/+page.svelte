<script lang="ts">
	import StreetAddressForm from '$lib/components/StreetAddressForm.svelte';

	export let data;
</script>

<div class="relative flex w-full grow justify-center overflow-visible">
	<section class="ml-auto">
		<h2>Checkout</h2>
		<h3>Build Your Tier</h3>

		<StreetAddressForm countries={data.countries} />
	</section>
	<section class="ml-auto min-w-4 overflow-visible border-l border-neutral-300 p-6">
		<h3>Order Summary</h3>
		<div class="sticky top-0">test</div>
	</section>
</div>
