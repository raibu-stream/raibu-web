<script>
	let value;
	let showSuccess;

	let copy = () => {
		navigator.clipboard.writeText(value.innerText);
		showSuccess = true;
		setTimeout(() => (showSuccess = false), 2000);
	};
</script>

<div class="flex items-center gap-y-1 gap-x-4 flex-wrap">
	<span
		bind:this={value}
		class="text-primary-200 rounded bg-secondary-700 px-1 select-all break-words overflow-hidden"
	>
		<slot />
	</span>
	<button on:click={copy} class="button font-semibold">
		{#if showSuccess}
			copied!
		{:else}
			copy
		{/if}
	</button>
</div>
