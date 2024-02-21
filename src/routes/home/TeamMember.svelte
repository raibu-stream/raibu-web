<script lang="ts">
	export let imageUrl: string;
	export let name: string;
	export let titles: string[];
</script>

<div class="flex min-h-80 items-center">
	<div
		class="team-member flex h-72 w-full flex-col items-center justify-center overflow-hidden rounded border border-neutral-300 bg-secondary-700 p-4 text-center shadow transition-transform ease-out"
	>
		<img src={imageUrl} alt="" class="pfp aspect-square h-28 rounded-full object-cover" />
		<div class="flex h-full flex-col items-center justify-between p-4">
			<div>
				<h4 class="name mb-1 text-xl font-bold !leading-tight">{name}</h4>
				{#each titles as title}
					<p class="!text-base font-medium !leading-tight tracking-tight text-neutral-200">
						{title}
					</p>
				{/each}
			</div>
			<div class="flex gap-4"><slot /></div>
		</div>
	</div>
</div>
