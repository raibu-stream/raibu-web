<script lang="ts">
	export let imageUrl: string;
	export let name: string;
	export let titles: string[];
	export let twitterUrl: string;
</script>

<div
	class="flex h-[9.5rem] items-center overflow-hidden rounded border border-neutral-300 bg-secondary-700 shadow transition-transform ease-out hover:scale-105"
>
	<img src={imageUrl} alt="" class="pfp aspect-square h-full object-cover" />
	<div class="flex h-full flex-col items-start justify-evenly p-4">
		<div>
			<h4 class="name text-xl font-bold !leading-tight">{name}</h4>
			{#each titles as title}
				<p class="!text-base font-medium !leading-tight tracking-tight text-neutral-200">{title}</p>
			{/each}
		</div>
		<a class="button link text-center font-medium" href={twitterUrl} target="_blank"> Twitter </a>
	</div>
</div>
