<div class="relative flex h-full w-full grow justify-center overflow-visible">
	<section class="ml-auto w-full max-w-3xl">
		<h2>Checkout</h2>
		<div class="grid w-full grid-cols-1 grid-rows-1">
			{#key undefined}
				<slot />
			{/key}
		</div>
	</section>
	<section class="ml-auto min-w-4 overflow-visible border-l border-neutral-300 p-6">
		<h3>Order Summary</h3>
		<div class="sticky top-0">test</div>
	</section>
</div>
