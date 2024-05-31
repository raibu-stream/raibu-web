<script lang="ts">
	import '../app.css';
	import '$lib/fonts/fonts.css';
	import ScrollTop from '$lib/components/ScrollTop.svelte';
	import Nav from './Nav.svelte';
	import Footer from './Footer.svelte';
	import '@fortawesome/fontawesome-free/css/all.min.css';
	import LoginModal from '$lib/components/LoginModal.svelte';
	import ResetPasswordModal from '$lib/components/resetPasswordModal.svelte';
	import type { LayoutServerData } from './$types';
	import Toaster from '$lib/components/Toaster.svelte';
	import SvelteSeo from 'svelte-seo';
	import { showLoginModal } from '../stores';
	import { writable } from 'svelte/store';

	export let data: LayoutServerData;

	let showResetPasswordModal = writable(false);

	if (data.resetPasswordToken !== null) {
		showResetPasswordModal.set(true);
	} else if (data.loginModal === 'true') {
		showLoginModal.set(true);
	}
</script>

<SvelteSeo
	title="Raibu | Low-latency Affordable Streaming"
	description="Low-latency affordable streaming for VRChat, personal websites, and businesses"
	canonical="https://raibu.stream/"
	keywords="streaming, vrchat, rtmp, subscription"
/>

<div class="overflow-x-clip bg-neutral-800 text-center text-neutral-100">
	<Toaster />
	<LoginModal redirectTo={data.redirectTo !== null ? data.redirectTo : undefined} />
	<ResetPasswordModal resetPasswordToken={data.resetPasswordToken} open={showResetPasswordModal} />
	<div class="flex min-h-screen flex-col overflow-visible">
		{#key data.loggedIn}
			<Nav
				isLoggedIn={data.loggedIn}
				email={data.email}
				topAlert={data.topAlert}
				isAdmin={data.isAdmin}
			/>
		{/key}
		<main class="relative flex w-full grow flex-col items-center overflow-visible">
			<slot />
			<ScrollTop></ScrollTop>
		</main>
	</div>
	<Footer />
</div>
