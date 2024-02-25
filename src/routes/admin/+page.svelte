<script>
	import SiteConfiguration from './SiteConfiguration.svelte';

	export let data;
</script>

<section class="section mb-6 items-center gap-4">
	<div class="mb-6">
		<h3 class="mb-1 border-b-0 text-3xl font-bold tracking-tight">Site Settings</h3>
		<small class="text-neutral-200">
			Here you can change various configuration options for the site as a whole
		</small>
	</div>

	<SiteConfiguration configs={data.configs} />
</section>

<style lang="postcss">
	.section {
		@apply w-full max-w-screen-section bg-secondary-800 p-6 text-left shadow-lg section:rounded;
	}
</style>
