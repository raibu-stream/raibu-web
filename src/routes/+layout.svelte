<script lang="ts">
	import '../app.css';
	import '$lib/fonts/fonts.css';
	import ScrollTop from './ScrollTop.svelte';
	import Nav from './Nav.svelte';
	import Footer from './Footer.svelte';
	import '@fortawesome/fontawesome-free/css/all.min.css';
	import LoginModal from '../lib/LoginModal.svelte';
	import ResetPasswordModal from '../lib/resetPasswordModal.svelte';
	import type { LayoutServerData } from './$types';

	export let data: LayoutServerData;
	let resetPasswordModalOn = data.resetPasswordToken !== null;
	let loginModalOn = data.loginModal === 'true';
</script>

<div class="overflow-x-clip bg-neutral-800 text-center text-neutral-100">
	<div class="flex min-h-screen flex-col overflow-visible">
		{#key data.loggedIn}
			<Nav loggedIn={data.loggedIn} email={data.email} />
		{/key}
		<ResetPasswordModal {resetPasswordModalOn} resetPasswordToken={data.resetPasswordToken} />
		<LoginModal {loginModalOn} />
		<main class="relative flex w-full grow flex-col items-center overflow-visible sm:pt-0">
			<slot />
			<ScrollTop></ScrollTop>
		</main>
	</div>

	<Footer />
</div>
