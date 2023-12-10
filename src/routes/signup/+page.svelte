<script>
	import PasswordInput from '$lib/PasswordInput.svelte';
	import commonPasswordList from 'fxa-common-password-list';
	import FormError from '$lib/FormError.svelte';
	import { dev } from '$app/environment';
	import { goto } from '$app/navigation';

	const MINIMUM_PASSWORD_LENGTH = 8;
	const emailRegex = /[^@\s]+@[^@\s]+/;

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
			if (res.statusText === 'OK') {
				goto('/user');
			} else {
				let data;
				try {
					data = await res.json();
				} catch {
					console.error(res);
					apiError = 'An unknown error occurred';
					return;
				}

				if (data.message !== undefined) {
					apiError = data.message;
				} else {
					console.warn(res);
					console.warn(data);
					apiError = 'An unknown error occurred';
				}
			}
		});
	};
</script>

<div class="flex sm:absolute inset-0 static text-left">
	<section class="sm:max-w-[450px] w-full py-8 sm:px-16 px-6">
		<!-- <p class="mt-8">We are not currently accepting sign ups. Come back later!</p> -->
		<h2 class="text-2xl font-bold mb-6 border-b border-neutral-300">Sign up</h2>
		<form on:submit|preventDefault={handleSubmit} novalidate>
			<label class="text-lg" for="email">Email</label>
			<div class="mt-2 mb-8">
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
			<label class="text-lg" for="password">Password</label>
			<div class="mt-2 mb-12">
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
			<button class="button w-full !text-lg">
				{#await request}
					<i class="fa-solid fa-circle-notch animate-spin" aria-hidden="true"></i>
					<span class="sr-only">Loading</span>
					<!-- eslint-disable-next-line no-unused-vars -->
				{:then _}
					Log in
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
	<div
		class="min-h-full object-cover hidden sm:block bg-raibu-pattern bg-repeat bg-[length:1750px] grow"
		alt=""
	/>
</div>
