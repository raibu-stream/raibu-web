<script>
	import '../app.css';
	import '$lib/fonts/CascadiaCode.css';
	import ScrollTop from './ScrollTop.svelte';
	import Nav from './Nav.svelte';
	import Footer from './Footer.svelte';
	import '@fortawesome/fontawesome-free/css/all.min.css';
</script>

<div class="bg-neutral-800 text-center overflow-x-clip">
	<Nav />
	<main
		class="text-neutral-100 w-full h-full min-h-screen flex flex-col items-center relative pt-18 sm:pt-0"
	>
		<slot />
		<ScrollTop></ScrollTop>
	</main>
	<Footer />
</div>
