<script>
	import PasswordInput from '$lib/PasswordInput.svelte';
	import commonPasswordList from 'fxa-common-password-list';
	import FormError from '$lib/FormError.svelte';
	import { dev } from '$app/environment';
	import { goto } from '$app/navigation';
	import emailRegex from '$lib/emailRegex';
	import handleApiResponse from '$lib/handleApiResponse';

	const MINIMUM_PASSWORD_LENGTH = 8;

	let request;
	let apiError;

	let password = '';
	let email = '';

	let passwordError;
	let emailError;

	const checkPasswordLength = (toCheck) => {
		const length = toCheck.length;
		if (length === 0) {
			return undefined;
		}
		if (length < MINIMUM_PASSWORD_LENGTH) {
			return `Must be at least ${MINIMUM_PASSWORD_LENGTH} characters`;
		}
		if (length > 255) {
			return 'Must be below 255 characters';
		}
		return undefined;
	};

	const handleSubmit = () => {
		apiError = undefined;

		if (password === '') {
			passwordError = 'Password is required';
			return;
		}
		if (email === '') {
			emailError = 'Email is required';
			return;
		}

		if (checkPasswordLength(password, MINIMUM_PASSWORD_LENGTH) !== undefined) {
			return;
		}

		if (!emailRegex.test(email)) {
			emailError = 'Must be valid email';
			return;
		}
		if (commonPasswordList.test(password)) {
			passwordError = 'Password is too common';
			return;
		}

		emailError = undefined;
		passwordError = undefined;

		request = fetch('/user/', {
			method: 'post',
			body: JSON.stringify({ email, password })
		}).then(async (res) => {
			apiError = await handleApiResponse(res, () => {
				goto('/user/email-verification?pre-sent=true');
			});
		});
	};
</script>

<div class="static flex w-full grow justify-center text-left sm:justify-normal">
	<section class="w-full max-w-[400px] px-6 py-8 sm:max-w-[450px] sm:px-16">
		<h2 class="mb-6 border-b border-neutral-300 text-2xl font-bold tracking-tight">Sign up</h2>
		<form on:submit|preventDefault={handleSubmit} novalidate>
			<label for="email">Email</label>
			<div class="mb-8 mt-2">
				<input
					class="input w-full"
					type="email"
					required
					pattern="[^@\s]+@[^@\s]+"
					id="email"
					autocomplete="email"
					bind:value={email}
				/>
				{#if emailError !== undefined}
					<FormError class="mt-2">{emailError}</FormError>
				{/if}
			</div>
			<label for="password">Password</label>
			<div class="mb-12 mt-2">
				<PasswordInput
					new
					bind:password
					onInput={(event) =>
						(passwordError = checkPasswordLength(event.target.value, MINIMUM_PASSWORD_LENGTH))}
				/>
				{#if passwordError !== undefined}
					<FormError class="mt-2">{passwordError}</FormError>
				{/if}
			</div>
			<button class="button w-full max-w-md !text-lg">
				{#await request}
					<i class="fa-solid fa-circle-notch animate-spin" aria-hidden="true"></i>
					<span class="sr-only">Loading</span>
					<!-- eslint-disable-next-line no-unused-vars -->
				{:then _}
					Sign up
				{/await}
			</button>
			{#if apiError !== undefined}
				<FormError class="mt-4">{apiError}</FormError>
			{/if}
			{#if !dev}
				<FormError class="mt-4">We are currently not accepting registrations</FormError>
			{/if}
		</form>
	</section>
	<div class="hidden grow bg-raibu-pattern bg-[length:1750px] bg-repeat object-cover sm:block" />
</div>
