<script lang="ts">
	import { page } from '$app/stores';
	import Payment from '$lib/components/Payment.svelte';
	import { quintOut } from 'svelte/easing';
	import { fade } from 'svelte/transition';
	import SvelteSeo from 'svelte-seo';

	export let data;
</script>

<SvelteSeo title="Payment | Raibu" />

<div class="col-start-1 row-start-1" transition:fade={{ duration: 700, easing: quintOut }}>
	<h3>Payment</h3>
	<div class="max-w-lg">
		<Payment
			clientSecret={data.clientSecret}
			returnUrl={$page.url.toString()}
			failed={data.failed}
			type="payment"
		/>
	</div>
</div>
