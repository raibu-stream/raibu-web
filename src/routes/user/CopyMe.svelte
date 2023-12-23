<script lang="ts">
	let value: HTMLElement;
	let showSuccess: boolean;

	let copy = () => {
		navigator.clipboard.writeText(value.innerText);
		showSuccess = true;
		setTimeout(() => (showSuccess = false), 2000);
	};
</script>

<div class="flex flex-wrap items-center gap-x-4 gap-y-1">
	<span
		bind:this={value}
		class="select-all overflow-hidden break-words rounded bg-secondary-700 px-1 text-primary-200"
	>
		<slot />
	</span>
	<button on:click={copy} class="button font-medium">
		{#if showSuccess}
			copied!
		{:else}
			copy
		{/if}
	</button>
</div>
