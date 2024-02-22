<script lang="ts">
	import { createPagination, melt } from '@melt-ui/svelte';
	import type { Writable } from 'svelte/store';

	export let total: number;
	export let perPage: number;
	export let currentPage: Writable<number>;

	const {
		elements: { root, pageTrigger, prevButton, nextButton },
		states: { pages }
	} = createPagination({
		count: total,
		page: currentPage,
		perPage
	});
</script>

<nav class="font-semibold" use:melt={$root}>
	<div class="flex gap-2">
		<button class="mr-2 disabled:text-neutral-300" use:melt={$prevButton}>
			<i class="fa-solid fa-angle-left" aria-hidden="true"></i>
			<span class="sr-only">previous page</span>
		</button>
		{#each $pages as page (page.key)}
			{#if page.type === 'ellipsis'}
				<span>...</span>
			{:else}
				<button class="data-[selected]:text-neutral-100" use:melt={$pageTrigger(page)}>
					{page.value}
				</button>
			{/if}
		{/each}
		<button class="ml-2 disabled:text-neutral-300" use:melt={$nextButton}>
			<i class="fa-solid fa-angle-right" aria-hidden="true"></i>
			<span class="sr-only">next page</span>
		</button>
	</div>
</nav>
