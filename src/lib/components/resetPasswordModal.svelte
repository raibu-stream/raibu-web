<script lang="ts">
	import { goto } from '$app/navigation';
	import FormError from './FormError.svelte';
	import Modal from './Modal.svelte';
	import PasswordInput from './PasswordInput.svelte';
	import commonPasswordList from 'fxa-common-password-list';
	import handleApiResponse from '$lib/handleApiResponse';
	import { modal } from '../../stores';

	export let resetPasswordToken: string | null;

	let password = '';

	let apiError: string | undefined;
	let passwordError: string | undefined;
	let request: Promise<unknown> | undefined;

	const handleSubmit = async () => {
		passwordError = undefined;
		apiError = undefined;

		if (password === '') {
			passwordError = 'Password is required';
			return;
		}
		if (commonPasswordList.test(password)) {
			passwordError = 'Password is too common';
			return;
		}

		request = fetch('/user/reset-password/reset', {
			method: 'post',
			body: JSON.stringify({ newPassword: password, token: resetPasswordToken })
		}).then(async (res) => {
			apiError = await handleApiResponse(res, async () => {
				goto('/user');
				$modal = undefined;
			});
		});
	};
</script>

<form class="col-start-1 row-start-1 px-1" on:submit|preventDefault={handleSubmit} novalidate>
	<label for="password">New password</label>
	<div class="mb-12 mt-2">
		<PasswordInput bind:password new />
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
			Reset
		{/await}
	</button>
	{#if apiError !== undefined}
		<FormError>{apiError}</FormError>
	{/if}
</form>
