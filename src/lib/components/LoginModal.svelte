<script lang="ts">
	import { goto } from '$app/navigation';
	import { fly } from 'svelte/transition';
	import FormError from './FormError.svelte';
	import PasswordInput from './PasswordInput.svelte';
	import emailRegex from '$lib/emailRegex';
	import handleApiResponse from '$lib/handleApiResponse';
	import { modal } from '../../stores';

	let password = '';
	let email = '';

	let apiError: string | undefined;
	let passwordError: string | undefined;
	let emailError: string | undefined;
	let request: Promise<unknown> | undefined;

	let forgetPassword = false;
	let successfulPasswordResetRequest = false;
	let loginFormHeight: number;

	$: if ($modal) $modal.title = forgetPassword ? 'Reset your password' : 'Log in';

	const handleSubmit = async () => {
		emailError = undefined;
		passwordError = undefined;
		apiError = undefined;

		if (password === '') {
			passwordError = 'Password is required';
			return;
		}
		if (email === '') {
			emailError = 'Email is required';
			return;
		}

		request = fetch('/user/session', {
			method: 'post',
			body: JSON.stringify({ email, password })
		}).then(async (res) => {
			apiError = await handleApiResponse(res, () => {
				goto('/user');
				$modal = undefined;
			});
		});
	};

	const handleForgetPassword = () => {
		emailError = undefined;
		passwordError = undefined;
		apiError = undefined;

		if (email === '') {
			emailError = 'Email is required';
			return;
		}
		if (!emailRegex.test(email)) {
			emailError = 'Must be valid email';
			return;
		}

		request = fetch('/user/reset-password/token', {
			method: 'post',
			body: JSON.stringify({ email })
		}).then(async (res) => {
			apiError = await handleApiResponse(res, () => {
				successfulPasswordResetRequest = true;
			});
		});
	};
</script>

{#if !forgetPassword}
	<form
		class="col-start-1 row-start-1 px-1"
		on:submit|preventDefault={handleSubmit}
		bind:clientHeight={loginFormHeight}
		novalidate
		transition:fly={{ x: -500, opacity: 0, duration: 350 }}
	>
		<div class="flex items-center justify-between">
			<label for="email">Email</label>
			<small>
				New to Raibu?
				<button type="button" on:click={() => ($modal = undefined)}>
					<a class="link font-semibold" href="/signup">Sign up</a>
				</button>
			</small>
		</div>
		<div class="mb-8 mt-2">
			<input class="input w-full" type="email" required id="email" bind:value={email} />
			{#if emailError !== undefined}
				<FormError class="mt-2">{emailError}</FormError>
			{/if}
		</div>

		<div class="flex items-center justify-between">
			<label for="password">Password</label>
			<small>
				<button
					type="button"
					class="link font-semibold"
					on:click={() => {
						forgetPassword = true;
						apiError = undefined;
					}}
				>
					Forgot password?
				</button>
			</small>
		</div>
		<div class="mb-12 mt-2">
			<PasswordInput bind:password />
			{#if passwordError !== undefined}
				<FormError class="mt-2">{passwordError}</FormError>
			{/if}
		</div>

		<button class="button mb-4 w-full !text-lg">
			{#await request}
				<i class="fa-solid fa-circle-notch animate-spin" aria-hidden="true"></i>
				<span class="sr-only">Loading</span>
				<!-- eslint-disable-next-line @typescript-eslint/no-unused-vars -->
			{:then _}
				Log in
			{/await}
		</button>
		{#if apiError !== undefined}
			<FormError>{apiError}</FormError>
		{/if}
	</form>
{:else}
	<form
		class="col-start-1 row-start-1 flex flex-col px-1"
		style:min-height="{loginFormHeight}px"
		on:submit|preventDefault={handleForgetPassword}
		novalidate
		transition:fly={{ x: 500, opacity: 0, duration: 350 }}
	>
		<button
			type="button"
			class="-mt-2 mb-4 flex items-center gap-2 text-lg font-medium tracking-tight"
			on:click={() => {
				forgetPassword = false;
				successfulPasswordResetRequest = false;
				apiError = undefined;
			}}
		>
			<i class="fa-solid fa-arrow-left-long" aria-hidden="true"></i>
			Back
		</button>
		<div class="grid h-full grid-cols-1 grid-rows-1">
			{#if !successfulPasswordResetRequest}
				<div
					transition:fly={{ x: -500, opacity: 0, duration: 350 }}
					class="col-start-1 row-start-1 px-1"
				>
					<label for="email">Email</label>
					<div class="mb-2 mt-2">
						<input class="input w-full" type="email" required id="email" bind:value={email} />
						{#if emailError !== undefined}
							<FormError class="mt-2">{emailError}</FormError>
						{/if}
					</div>

					<p class="mb-6">
						<small>
							If the account exists, we'll email you instructions to reset the password.
						</small>
					</p>
					<button class="button mb-4 w-full !text-lg">
						{#await request}
							<i class="fa-solid fa-circle-notch animate-spin" aria-hidden="true"></i>
							<span class="sr-only">Loading</span>
							<!-- eslint-disable-next-line @typescript-eslint/no-unused-vars -->
						{:then _}
							Reset password
						{/await}
					</button>
					{#if apiError !== undefined}
						<FormError>{apiError}</FormError>
					{/if}
				</div>
			{:else}
				<div transition:fly={{ x: 500, opacity: 0, duration: 350 }} class="col-start-1 row-start-1">
					<div class="mb-2 rounded bg-primary-400 bg-opacity-50 p-2 pr-4 text-sm">
						<p>
							<i class="fa-solid fa-circle-check" aria-hidden="true"></i>
							We sent an email to {email} with instructions.
						</p>
					</div>
					<small class="text-xs text-neutral-200">
						If the email doesn't show up, check your spam folder. We sent it from
						noreply@raibu.stream. If you still don't see it, your email address may not be verified.
					</small>
				</div>
			{/if}
		</div>
	</form>
{/if}