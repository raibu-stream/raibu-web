<script lang="ts">
	export let headings: string[];
</script>

<section class="rounded bg-secondary-700 text-sm">
	<div class="flex flex-col flex-nowrap overflow-auto rounded-t">
		<table class="w-full overflow-visible whitespace-nowrap text-left">
			<tr
				class="h-12 w-full border-b-2 border-neutral-300 bg-secondary-800 uppercase text-neutral-200"
			>
				{#each headings as heading, index}
					<th
						class="pr-4 font-medium"
						class:pl-6={index === 0}
						class:pr-10={index + 1 === headings.length}
					>
						{heading}
					</th>
				{/each}
			</tr>
			<slot />
		</table>
	</div>
	<div
		class="flex h-12 w-full items-center justify-between rounded-b border-t-2 border-neutral-300 bg-secondary-800 px-6 text-neutral-200"
	>
		<slot name="footer" />
	</div>
</section>
