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
	import Modal from '$lib/components/Modal.svelte';
	import Toaster from '$lib/components/Toaster.svelte';
	import { modal } from '../stores';

	export let data: LayoutServerData;

	if (data.resetPasswordToken !== null) {
		$modal = {
			component: ResetPasswordModal,
			props: { resetPasswordToken: data.resetPasswordToken },
			title: 'Reset your password'
		};
	} else if (data.loginModal === 'true') {
		$modal = {
			component: LoginModal,
			props: data.redirectTo !== null ? { redirectTo: data.redirectTo } : undefined,
			title: 'Login'
		};
	}
</script>

<div class="overflow-x-clip bg-neutral-800 text-center text-neutral-100">
	<Toaster />
	<Modal />
	<div class="flex min-h-screen flex-col overflow-visible">
		{#key data.loggedIn}
			<Nav isLoggedIn={data.loggedIn} email={data.email} />
		{/key}
		<main class="relative flex w-full grow flex-col items-center overflow-visible">
			<slot />
			<ScrollTop></ScrollTop>
		</main>
	</div>
	<Footer />
</div>
