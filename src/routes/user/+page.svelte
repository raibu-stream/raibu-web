<script lang="ts">
	import Streams from './Streams.svelte';
	import type { PageServerData } from './$types';
	import PasswordInput from '$lib/components/PasswordInput.svelte';
	import { meltLabel } from '$lib/utils';
	import { melt } from '@melt-ui/svelte';
	import Modal from '$lib/components/Modal.svelte';
	import { goto } from '$app/navigation';
	import SvelteSeo from 'svelte-seo';
	import FormError from '$lib/components/FormError.svelte';
	import { handleApiResponse, loginPassword, password as signupPassword } from '$lib/utils.js';
	import { toast } from 'svelte-sonner';
	import { getPreset } from '$lib/tier';

	export let data: PageServerData;

	let resetOldPassword = '';
	let resetNewPassword = '';
	let resetPasswordApiError: string | undefined;
	let resetOldPasswordError: string | undefined;
	let resetNewPasswordError: string | undefined;
	let resetPasswordRequest: Promise<unknown> | undefined;

	const checkOldPassword = (password: string) => {
		let parsedPassword = loginPassword.safeParse(password);
		if (!parsedPassword.success) {
			return parsedPassword.error.format()._errors[0];
		}
	};

	const checkNewPassword = (password: string) => {
		let parsedPassword = signupPassword.safeParse(password);
		if (!parsedPassword.success) {
			return parsedPassword.error.format()._errors[0];
		}
	};

	const handleResetPasswordSubmit = async () => {
		resetPasswordApiError = undefined;
		resetOldPasswordError = undefined;
		resetNewPasswordError = undefined;

		resetOldPasswordError = checkOldPassword(resetOldPassword);
		if (resetOldPasswordError !== undefined) {
			return;
		}

		resetNewPasswordError = checkNewPassword(resetNewPassword);
		if (resetNewPasswordError !== undefined) {
			return;
		}

		resetPasswordRequest = fetch('/user/reset-password/reset', {
			method: 'post',
			body: JSON.stringify({ newPassword: resetNewPassword, oldPassword: resetOldPassword })
		}).then(async (res) => {
			resetPasswordApiError = await handleApiResponse(res, () => {
				toast.success('Password updated!');
			});
		});
	};

	let changePasswordTrigger: any;
	let changeEmailTrigger: any;
	let deleteAccountTrigger: any;
</script>

<SvelteSeo title="Dashboard | Raibu" />

<div class="my-10 w-full max-w-section-breakout">
	<h2 class="text-left text-4xl font-bold tracking-tight">Dashboard</h2>
</div>

<section class="section mb-6 flex items-center gap-4">
	<button
		class="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-transparent bg-primary-400 text-2xl font-semibold uppercase leading-none text-neutral-100 transition-colors duration-100"
	>
		{data.email[0]}
	</button>
	<div class="flex flex-col">
		<span>{data.email}</span>
		<small class="text-neutral-200">
			{#if data.tier !== undefined}
				{#if getPreset(data.tier) !== undefined}
					{getPreset(data.tier)}
				{:else}
					Custom tier: {data.tier.maxConcurrentStreams} streams with {data.tier
						.maxConcurrentViewers} viewers @ {data.tier.maxBitrateInKbps} kbps
				{/if}
			{:else}
				No tier selected. <a class="underline" href="/user/subscribe">Let's change that.</a>
			{/if}
		</small>
	</div>
</section>

<section class="section mb-6 !p-0">
	<div class="p-6">
		<h3 class="mb-1 border-b-0 text-3xl font-bold tracking-tight">Account Information</h3>
		<small class="text-neutral-200">Here you can change your account information</small>
	</div>
	<div class="text-sm">
		{#if $changeEmailTrigger}
			<button
				class="flex w-full justify-between p-6 text-left hover:bg-neutral-300"
				use:melt={$changeEmailTrigger}
			>
				<div class="flex w-full md:w-2/3">
					<span class="flex-1 basis-1/2 text-neutral-200">Email</span>
					<span class="flex-1 basis-1/2">{data.email}</span>
				</div>
				<span class="hidden md:inline">
					<i class="fa-solid fa-chevron-right" aria-hidden="true"></i>
					<span class="sr-only">Edit</span>
				</span>
			</button>
		{/if}
		{#if $changePasswordTrigger}
			<button
				class="flex w-full justify-between p-6 text-left hover:bg-neutral-300"
				use:melt={$changePasswordTrigger}
			>
				<div class="flex w-full md:w-2/3">
					<span class="flex-1 basis-1/2 text-neutral-200">Password</span>
					<span class="flex-1 basis-1/2">************</span>
				</div>
				<span class="hidden md:inline">
					<i class="fa-solid fa-chevron-right" aria-hidden="true"></i>
					<span class="sr-only">Edit</span>
				</span>
			</button>
		{/if}
	</div>
</section>

<section class="section mb-6">
	<div class="mb-6">
		<h3 class="mb-1 border-b-0 text-3xl font-bold tracking-tight">Delete account</h3>
		<small class="text-neutral-200">Here you can delete your account</small>
	</div>
	<div class="flex">
		{#if $deleteAccountTrigger}
			<button class="button ml-auto text-base" use:melt={$deleteAccountTrigger}
				>Delete account</button
			>
		{/if}
	</div>
</section>

<section class="flex w-full max-w-section flex-col items-center">
	<div class="section h-52">
		<div class="mb-6">
			<h3 class="mb-1 border-b-0 text-3xl font-bold tracking-tight">Streams</h3>
			<small class="text-neutral-200">Here you can create and manage your streams</small>
		</div>
	</div>
	<Streams />
</section>

<Modal
	titleString="You have no tier selected!"
	type="alertdialog"
	defaultOpen={data.tier === undefined}
	let:close
	let:description
>
	<p class="mb-8" use:melt={description}>Subscribe to a tier to start streaming!</p>
	<div class="flex justify-end gap-3">
		<button class="button" use:melt={close} on:m-click={() => goto('/user/subscribe')}>
			Go to checkout
		</button>
		<button class="button button-invert" use:melt={close}>Later</button>
	</div>
</Modal>

<Modal
	titleString="Change password"
	let:close
	maxWidthPx={450}
	bind:trigger={changePasswordTrigger}
>
	<form on:submit|preventDefault={handleResetPasswordSubmit} novalidate class="flex flex-col">
		<div class="mb-6">
			<div class="mb-6">
				<label for="password" use:melt={$meltLabel}>Old Password</label>
				<div class="mt-2">
					<PasswordInput bind:password={resetOldPassword} />
				</div>
				{#if resetOldPasswordError !== undefined}
					<FormError class="mt-2">{resetOldPasswordError}</FormError>
				{/if}
			</div>
			<div>
				<label for="password" use:melt={$meltLabel}>New Password</label>
				<div class="mt-2">
					<PasswordInput bind:password={resetNewPassword} new />
				</div>
				{#if resetNewPasswordError !== undefined}
					<FormError class="mt-2">{resetNewPasswordError}</FormError>
				{/if}
			</div>
			{#if resetPasswordApiError !== undefined}
				<FormError class="mt-2">{resetPasswordApiError}</FormError>
			{/if}
		</div>
		<button class="button float-right ml-auto px-8 text-base">
			{#await resetPasswordRequest}
				<i class="fa-solid fa-circle-notch animate-spin" aria-hidden="true"></i>
				<span class="sr-only">Loading</span>
				<!-- eslint-disable-next-line @typescript-eslint/no-unused-vars -->
			{:then _}
				Update
			{/await}
		</button>
	</form>
</Modal>

<Modal titleString="Change email" let:close maxWidthPx={450} bind:trigger={changeEmailTrigger}>
	<form class="flex flex-col">
		<label for="email" use:melt={$meltLabel}>Email</label>
		<div class="mb-8">
			<input type="email" id="email" class="input w-full" />
		</div>
		<button class="button ml-auto px-8 text-base">Update</button>
	</form>
</Modal>

<Modal
	titleString="Delete account"
	let:close
	let:description
	maxWidthPx={450}
	bind:trigger={deleteAccountTrigger}
>
	<p class="mb-8" use:melt={description}>Delete your account.</p>
</Modal>

<style lang="postcss">
	.section {
		@apply w-full max-w-screen-section bg-secondary-800 p-6 text-left shadow-lg section:rounded;
	}
</style>
