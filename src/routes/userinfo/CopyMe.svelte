<script>
	let value;
	let showSuccess;

	let copy = () => {
		console.log(value.innerText);
		navigator.clipboard.writeText(value.innerText);
		showSuccess = true;
		setTimeout(() => (showSuccess = false), 2000);
	};
</script>

<span
	bind:this={value}
	class="text-primary-200 border-secondary-800 border rounded bg-secondary-800 px-1 select-al"
	><slot /></span
>
<button
	on:click={copy}
	class="text-primary-200 border border-primary-200 rounded bg-secondary-800 px-1 transition-all duration-200 ease-in-out active:scale-95 hover:bg-primary-200 hover:text-secondary-800 font-semibold"
>
	{#if showSuccess}
		copied!
	{:else}
		copy
	{/if}
</button>
