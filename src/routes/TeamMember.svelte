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
	<div class="p-4 h-full flex flex-col justify-evenly items-start">
		<div>
			<h4 class="name font-bold text-xl !leading-tight">{name}</h4>
			{#each titles as title}
				<p class="font-medium !text-base text-neutral-200 !leading-tight tracking-tight">{title}</p>
			{/each}
		</div>
		<a class="button text-center" href={twitterUrl} target="_blank"> Twitter </a>
	</div>
</div>
