<script lang="ts">
	import type { Page } from '@sveltejs/kit';

	export let page: Partial<Page<Record<string, string>, string | null>>;
</script>

<div class="flex grow flex-col justify-center gap-2 pb-18">
	<h2 class="-mb-2 text-6xl font-bold">{page.status}</h2>
	<p class="italic text-neutral-200">{page.error?.message}</p>
	{#if page.error?.errorId !== undefined}
		<small class="mt-2 select-all">{page.error?.errorId}</small>
	{/if}
</div>
