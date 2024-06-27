<script lang="ts">
	import { page } from '$app/stores';
</script>

<div class="flex grow flex-col justify-center gap-2 pb-18">
	<h2 class="-mb-2 text-6xl font-bold">{$page.status}</h2>
	<p class="max-w-2xl italic text-neutral-200">{$page.error?.message}</p>
	{#if $page.error?.errorId !== undefined}
		<small class="mt-2 select-all">{$page.error?.errorId}</small>
	{/if}
</div>
