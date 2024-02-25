<script lang="ts">
	import PasswordInput from '$lib/components/PasswordInput.svelte';
	import FormError from '$lib/components/FormError.svelte';
	import { dev } from '$app/environment';
	import { goto } from '$app/navigation';
	import {
		handleApiResponse,
		password as zPassword,
		email as zEmail,
		meltLabel
	} from '$lib/utils.js';
	import { melt } from '@melt-ui/svelte';

	export let data;

	let request: Promise<unknown> | undefined;
	let apiError: string | undefined = data.signupDisabledMessage;

	let password = '';
	let email = '';

	let passwordError: string | undefined;
	let emailError: string | undefined;

	const checkPassword = (password: string) => {
		let parsedPassword = zPassword.safeParse(password);
		if (!parsedPassword.success) {
			return parsedPassword.error.format()._errors[0];
		}
	};

	const checkEmail = (email: string) => {
		let parsedEmail = zEmail.safeParse(email);
		if (!parsedEmail.success) {
			return parsedEmail.error.format()._errors[0];
		}
	};

	const handleSubmit = () => {
		apiError = undefined;

		emailError = checkEmail(email);
		if (emailError !== undefined) {
			return;
		}

		passwordError = checkPassword(password);
		if (passwordError !== undefined) {
			return;
		}

		emailError = undefined;
		passwordError = undefined;

		request = fetch('/user/', {
			method: 'post',
			body: JSON.stringify({ email, password })
		}).then(async (res) => {
			apiError = await handleApiResponse(res, async () => {
				goto('/user/email-verification?pre-sent=true', { invalidateAll: true });
			});
		});
	};
</script>

<div class="static flex w-full grow justify-center text-left sm:justify-normal">
	<section class="w-full max-w-[400px] px-6 py-8 sm:max-w-[450px] sm:px-16">
		<h2 class="mb-6 border-b border-neutral-300 text-2xl font-bold tracking-tight">Sign up</h2>
		<form on:submit|preventDefault={handleSubmit} novalidate>
			<label for="email" use:melt={$meltLabel}>Email</label>
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
			<label for="password" use:melt={$meltLabel}>Password</label>
			<div class="mb-12 mt-2">
				<PasswordInput
					new
					bind:password
					on:input={() => (passwordError = checkPassword(password))}
				/>
				{#if passwordError !== undefined}
					<FormError class="mt-2">{passwordError}</FormError>
				{/if}
			</div>
			<button class="button w-full max-w-md !text-lg">
				{#await request}
					<i class="fa-solid fa-circle-notch animate-spin" aria-hidden="true"></i>
					<span class="sr-only">Loading</span>
					<!-- eslint-disable-next-line @typescript-eslint/no-unused-vars -->
				{:then _}
					Sign up
				{/await}
			</button>
			{#if apiError !== undefined}
				<FormError class="mt-4">{apiError}</FormError>
			{/if}
		</form>
	</section>
	<div class="hidden grow bg-raibu-pattern bg-[length:1750px] bg-repeat object-cover sm:block" />
</div>
