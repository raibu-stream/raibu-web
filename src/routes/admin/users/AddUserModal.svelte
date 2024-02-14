<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import FormError from '$lib/components/FormError.svelte';
	import PasswordInput from '$lib/components/PasswordInput.svelte';
	import { checkPasswordLength, handleApiResponse } from '$lib/utils';
	import { modal } from '../../../stores';

	let request: Promise<unknown> | undefined;
	let apiError: string | undefined;

	let password = '';
	let email = '';

	let passwordError: string | undefined;
	let emailError: string | undefined;

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

		emailError = undefined;
		passwordError = undefined;

		request = fetch('/admin/users/', {
			method: 'post',
			body: JSON.stringify({ email, password })
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
	<div class="mb-10 mt-2">
		<PasswordInput
			new
			bind:password
			on:input={() => (passwordError = checkPasswordLength(password))}
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
			Create user
		{/await}
	</button>
	{#if apiError !== undefined}
		<FormError class="mt-4">{apiError}</FormError>
	{/if}
</form>
