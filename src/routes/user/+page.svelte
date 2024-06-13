<script lang="ts">
	import Streams from './Streams.svelte';
	import type { PageServerData } from './$types';
	import PasswordInput from '$lib/components/PasswordInput.svelte';
	import { meltLabel } from '$lib/utils';
	import { melt } from '@melt-ui/svelte';
	import Modal from '$lib/components/Modal.svelte';
	import { goto, invalidateAll } from '$app/navigation';
	import SvelteSeo from 'svelte-seo';
	import FormError from '$lib/components/FormError.svelte';
	import {
		handleApiResponse,
		loginPassword,
		password as signupPassword,
		email as signupEmail
	} from '$lib/utils.js';
	import { toast } from 'svelte-sonner';
	import { getPreset } from '$lib/tier';
	import { fly, slide } from 'svelte/transition';
	import SegmentedInput from '$lib/components/SegmentedInput.svelte';
	import type { Readable } from 'svelte/store';

	export let data: PageServerData;

	let resetOldPassword = '';
	let resetNewPassword = '';
	let resetPasswordApiError: string | undefined;
	let resetOldPasswordError: string | undefined;
	let resetNewPasswordError: string | undefined;
	let resetPasswordRequest: Promise<unknown> | undefined;

	let deleteAccountRequest: Promise<unknown> | undefined;
	let deleteAccountApiError: string | undefined;
	let deleteAccountConfirmation = '';

	const updateEmailApiSuccessfulMessage =
		'Your verification email has been sent successfully. Please check your spam folder. It will expire in 30 minutes.';
	let updateEmailRequest: Promise<unknown> | undefined;
	let updateEmailWaitingForCode = false;
	let updateEmailApiError: string | undefined;
	let updateEmailEmailError: string | undefined;
	let updateEmailPasswordError: string | undefined;
	let isUpdateEmailModalOpen: any;
	let updateEmailEmail = '';
	let updateEmailPassword = '';
	let updateEmailCode: Readable<string>;
	let isUpdateEmailCodeReady = false;
	let updateEmailVerifyTimer = 60;
	let updateEmailVerifyTimerInterval: NodeJS.Timeout | undefined = undefined;

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
		resetNewPasswordError = checkNewPassword(resetNewPassword);
		if (resetNewPasswordError !== undefined) {
			return;
		}
		if (resetOldPasswordError !== undefined) {
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

	const handleDeleteAccountSubmit = async () => {
		deleteAccountApiError = undefined;
		deleteAccountRequest = fetch('/user', {
			method: 'delete'
		}).then(async (res) => {
			deleteAccountApiError = await handleApiResponse(res, async () => {
				await goto('/', {
					invalidateAll: true
				});
				toast.success('Account deleted');
			});
		});
	};

	const handleUpdateEmailSubmit = async () => {
		updateEmailApiError = undefined;
		updateEmailEmailError = undefined;
		updateEmailPasswordError = undefined;

		updateEmailPasswordError = checkOldPassword(updateEmailPassword);
		let parsedEmail = signupEmail.safeParse(updateEmailEmail);
		if (!parsedEmail.success) {
			updateEmailEmailError = parsedEmail.error.format()._errors[0];
			return;
		}
		if (updateEmailPasswordError !== undefined) {
			return;
		}

		updateEmailRequest = fetch('/user/email-verification/code', {
			method: 'put',
			body: JSON.stringify({ email: updateEmailEmail, password: updateEmailPassword })
		}).then(async (res) => {
			let error = await handleApiResponse(res, async () => {
				updateEmailApiError = undefined;
				updateEmailEmailError = undefined;
				updateEmailWaitingForCode = true;
				updateEmailApiError = updateEmailApiSuccessfulMessage;

				updateEmailVerifyTimer = 60;
				updateEmailVerifyTimerInterval = setInterval(() => {
					updateEmailVerifyTimer -= 1;

					if (updateEmailVerifyTimer === 0) {
						clearInterval(updateEmailVerifyTimerInterval);
						updateEmailRequest = undefined;
						updateEmailVerifyTimerInterval = undefined;
						return;
					}
				}, 1000);
			});

			if (error !== undefined) {
				updateEmailApiError = error;
				updateEmailRequest = undefined;
			}
		});
	};

	const handleUpdateEmailVerifySubmit = async () => {
		updateEmailApiError = undefined;

		let parsedEmail = signupEmail.safeParse(updateEmailEmail);
		if (!parsedEmail.success) {
			updateEmailEmailError = parsedEmail.error.format()._errors[0];
			return;
		}

		updateEmailRequest = fetch('/user/email-verification/verify', {
			method: 'post',
			body: JSON.stringify({ code: $updateEmailCode })
		}).then(async (res) => {
			updateEmailApiError = await handleApiResponse(res, async () => {
				await invalidateAll();
				isUpdateEmailModalOpen.set(false);
				updateEmailApiError = undefined;
				updateEmailEmailError = undefined;
				updateEmailWaitingForCode = false;
				updateEmailRequest = undefined;
				updateEmailPasswordError = undefined;
				updateEmailEmail = '';
				updateEmailPassword = '';
				clearInterval(updateEmailVerifyTimerInterval);
				updateEmailVerifyTimerInterval = undefined;

				toast.success('Email updated!');
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
			<button class="button ml-auto text-base" use:melt={$deleteAccountTrigger}>
				Delete account
			</button>
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
	<form on:submit|preventDefault={handleResetPasswordSubmit} novalidate class="flex flex-col px-1">
		<div class="mb-8">
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
		<button class="button px-8 text-base">
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

<Modal
	titleString="Change email"
	maxWidthPx={450}
	bind:trigger={changeEmailTrigger}
	bind:open={isUpdateEmailModalOpen}
>
	{#if !updateEmailWaitingForCode}
		<form
			class="col-start-1 row-start-1 flex flex-col px-1"
			on:submit|preventDefault={handleUpdateEmailSubmit}
			novalidate
			transition:fly={{ x: -500, opacity: 0, duration: 350 }}
		>
			<label for="email" use:melt={$meltLabel}>New email</label>
			<div class="mb-8 mt-2">
				<input type="email" id="email" class="input w-full" bind:value={updateEmailEmail} />
				{#if updateEmailEmailError !== undefined}
					<FormError class="mt-2">{updateEmailEmailError}</FormError>
				{/if}
			</div>
			<label for="password" use:melt={$meltLabel}>Password</label>
			<div class="mb-8 mt-2">
				<PasswordInput bind:password={updateEmailPassword} />
				{#if updateEmailPasswordError !== undefined}
					<FormError class="mt-2">{updateEmailPasswordError}</FormError>
				{/if}
			</div>
			<button class="button px-8 text-base">
				{#await updateEmailRequest}
					<i class="fa-solid fa-circle-notch animate-spin" aria-hidden="true"></i>
					<span class="sr-only">Loading</span>
					<!-- eslint-disable-next-line @typescript-eslint/no-unused-vars -->
				{:then _}
					Confirm
				{/await}
			</button>
			{#if updateEmailApiError !== undefined}
				<FormError class="mt-2">{updateEmailApiError}</FormError>
			{/if}
		</form>
	{:else}
		<form
			class="col-start-1 row-start-1 flex flex-col items-center px-1"
			on:submit|preventDefault={handleUpdateEmailVerifySubmit}
			novalidate
			transition:fly={{ x: 500, opacity: 0, duration: 350 }}
		>
			<button
				type="button"
				class="-mt-2 mb-4 mr-auto flex items-center gap-2 text-lg font-medium tracking-tight"
				on:click={() => {
					updateEmailApiError = undefined;
					updateEmailEmailError = undefined;
					updateEmailWaitingForCode = false;
					updateEmailRequest = undefined;
					updateEmailPasswordError = undefined;
					clearInterval(updateEmailVerifyTimerInterval);
					updateEmailVerifyTimerInterval = undefined;
				}}
			>
				<i class="fa-solid fa-arrow-left-long" aria-hidden="true"></i>
				Back
			</button>
			<SegmentedInput
				bind:value={updateEmailCode}
				bind:isFull={isUpdateEmailCodeReady}
				class="!bg-secondary-700 !text-sm"
			/>
			<button class="button button-invert mt-4 w-full text-lg" disabled={!isUpdateEmailCodeReady}>
				{#await updateEmailRequest}
					<i class="fa-solid fa-circle-notch animate-spin" aria-hidden="true"></i>
					<span class="sr-only">Loading</span>
					<!-- eslint-disable-next-line @typescript-eslint/no-unused-vars -->
				{:then _}
					Submit
				{/await}
			</button>
			<div class="mt-2 text-sm">
				Email not received?
				<button
					type="button"
					class="font-semibold disabled:text-neutral-200"
					on:click={handleUpdateEmailSubmit}
					disabled={updateEmailVerifyTimerInterval !== undefined}
				>
					Resend email
				</button>
				{#if updateEmailRequest !== undefined}
					<span transition:slide>
						{#await updateEmailRequest}
							<i class="fa-solid fa-circle-notch animate-spin" aria-hidden="true"></i>
							<span class="sr-only">Loading</span>
							<!-- eslint-disable-next-line @typescript-eslint/no-unused-vars -->
						{:then _}
							- {updateEmailVerifyTimer}s
						{/await}
					</span>
				{/if}

				{#if updateEmailApiError}
					<FormError class="mt-2">{updateEmailApiError}</FormError>
				{/if}
			</div>
		</form>
	{/if}
</Modal>

<Modal
	titleString="Delete account"
	let:description
	maxWidthPx={450}
	bind:trigger={deleteAccountTrigger}
>
	<form class="mx-1 flex flex-col" on:submit|preventDefault={handleDeleteAccountSubmit} novalidate>
		<p class="mb-6 text-sm" use:melt={description}>
			To delete your account, type in "<span class="select-all"
				>this will delete my account and my subscription</span
			>"
		</p>
		<input type="text" class="input mb-4" bind:value={deleteAccountConfirmation} />
		<button
			class="button text-base"
			disabled={deleteAccountConfirmation.toLowerCase() !==
				'this will delete my account and my subscription'}
		>
			{#await deleteAccountRequest}
				<i class="fa-solid fa-circle-notch animate-spin" aria-hidden="true"></i>
				<span class="sr-only">Loading</span>
				<!-- eslint-disable-next-line @typescript-eslint/no-unused-vars -->
			{:then _}
				Confirm
			{/await}
		</button>
		{#if deleteAccountApiError !== undefined}
			<FormError class="mt-2">{deleteAccountApiError}</FormError>
		{/if}
	</form>
</Modal>

<style lang="postcss">
	.section {
		@apply w-full max-w-screen-section bg-secondary-800 p-6 text-left shadow-lg section:rounded;
	}
</style>
