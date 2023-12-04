<script>
	export let imageUrl;
	export let name;
	export let titles;
	export let twitterUrl;
</script>

<div
	class="bg-secondary-700 border border-neutral-300 h-[9.5rem] rounded flex items-center shadow overflow-hidden hover:scale-105 transition-transform ease-out"
>
	<img src={imageUrl} alt="" class="pfp h-full object-cover aspect-square" />
	<div class="content p-4 h-full flex flex-col justify-evenly">
		<div>
			<p class="name font-bold text-xl">{name}</p>
			{#each titles as title}
				<p class="font-normal !text-base text-neutral-200 !leading-tight">{title}</p>
			{/each}
		</div>
		<a class="" href={twitterUrl} target="_blank">
			<button class="social">Twitter</button>
		</a>
	</div>
</div>

<style lang="postcss">
	.content * {
		@apply m-0;
	}
</style>
