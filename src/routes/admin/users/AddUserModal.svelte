<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import Checkbox from '$lib/components/Checkbox.svelte';
	import FormError from '$lib/components/FormError.svelte';
	import PasswordInput from '$lib/components/PasswordInput.svelte';
	import { handleApiResponse, loginPassword as zPassword, email as zEmail } from '$lib/utils';
	import type { Readable } from 'svelte/store';
	import { modal } from '../../../stores';

	let request: Promise<unknown> | undefined;
	let apiError: string | undefined;

	let password = '';
	let email = '';

	let passwordError: string | undefined;
	let emailError: string | undefined;

	let shouldSendVerificationEmail: Readable<boolean>;

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
		emailError = undefined;
		passwordError = undefined;
		apiError = undefined;

		emailError = checkEmail(email);
		if (emailError !== undefined) {
			return;
		}

		passwordError = checkPassword(password);
		if (passwordError !== undefined) {
			return;
		}

		request = fetch('/admin/users/', {
			method: 'post',
			body: JSON.stringify({
				email,
				password,
				shouldSendVerificationEmail: $shouldSendVerificationEmail
			})
		}).then(async (res) => {
			apiError = await handleApiResponse(res, () => {
				$modal = undefined;
				invalidateAll();
			});
		});
	};
</script>

<form on:submit|preventDefault={handleSubmit} novalidate class="px-2">
	<label for="email">Email</label>
	<div class="mb-8 mt-2">
		<input
			class="input w-full"
			type="email"
			required
			id="email"
			autocomplete="email"
			bind:value={email}
		/>
		{#if emailError !== undefined}
			<FormError class="mt-2">{emailError}</FormError>
		{/if}
	</div>
	<label for="password">Password</label>
	<div class="mb-8 mt-2">
		<PasswordInput new bind:password />
		{#if passwordError !== undefined}
			<FormError class="mt-2">{passwordError}</FormError>
		{/if}
	</div>
	<div class="mb-10 flex items-center gap-3">
		<Checkbox bind:isChecked={shouldSendVerificationEmail} />
		<label for="password" class="text-sm">Send verification email</label>
	</div>
	<button class="button w-full max-w-md !text-lg">
		{#await request}
			<i class="fa-solid fa-circle-notch animate-spin" aria-hidden="true"></i>
			<span class="sr-only">Loading</span>
			<!-- eslint-disable-next-line @typescript-eslint/no-unused-vars -->
		{:then _}
			Create user
		{/await}
	</button>
	{#if apiError !== undefined}
		<FormError class="mt-4">{apiError}</FormError>
	{/if}
</form>
