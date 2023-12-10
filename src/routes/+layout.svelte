<script>
	import '../app.css';
	import '$lib/fonts/CascadiaCode.css';
	import ScrollTop from './ScrollTop.svelte';
	import Nav from './Nav.svelte';
	import Footer from './Footer.svelte';
	import '@fortawesome/fontawesome-free/css/all.min.css';
	import LoginModal from '../lib/LoginModal.svelte';

	export let data;
	const loginModalOn = data.loginModal === 'true';
</script>

<div class="bg-neutral-800 text-neutral-100 text-center overflow-x-clip">
	{#key data.loggedIn}
		<Nav loggedIn={data.loggedIn} email={data.email} />
	{/key}
	<LoginModal {loginModalOn} />
	<main class="w-full h-full min-h-screen flex flex-col items-center relative pt-18 sm:pt-0">
		<slot />
		<ScrollTop></ScrollTop>
	</main>
	<Footer />
</div>
