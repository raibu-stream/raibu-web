<script lang="ts">
	import { onMount } from 'svelte';

	export let visible: boolean;
	export let topAlert: { id: string; message: string };
	export let alertDismissed = true;

	onMount(() => {
		let storedDismissedMessage = localStorage.getItem(topAlert.id);
		alertDismissed = storedDismissedMessage === 'true';
	});
</script>

{#if !alertDismissed}
	<div
		class="sticky -top-10 z-30 flex h-10 items-center justify-center border-b border-neutral-300 bg-primary-400 px-6 transition-all"
		class:!top-0={visible}
	>
		<p class="ml-auto">{topAlert.message}</p>
		<button
			class="ml-auto"
			on:click={() => {
				alertDismissed = true;
				localStorage.setItem(topAlert.id + '_topAlert', 'true');
			}}
		>
			<i class="fa-solid fa-x"></i>
			<span class="sr-only">close alert</span>
		</button>
	</div>
{/if}
