<script lang="ts">
	import { goto } from '$app/navigation';
	import FormError from './FormError.svelte';
	import PasswordInput from './PasswordInput.svelte';
	import { handleApiResponse, meltLabel, password as zPassword } from '$lib/utils.js';
	import { melt } from '@melt-ui/svelte';
	import Modal from './Modal.svelte';
	import type { Writable } from 'svelte/store';

	export let resetPasswordToken: string | null;
	export let open: Writable<boolean>;

	let password = '';

	let apiError: string | undefined;
	let passwordError: string | undefined;
	let request: Promise<unknown> | undefined;

	const checkPassword = (password: string) => {
		let parsedPassword = zPassword.safeParse(password);
		if (!parsedPassword.success) {
			return parsedPassword.error.format()._errors[0];
		}
	};

	const handleSubmit = async () => {
		passwordError = undefined;
		apiError = undefined;

		passwordError = checkPassword(password);
		if (passwordError !== undefined) {
			return;
		}

		request = fetch('/user/reset-password/reset', {
			method: 'post',
			body: JSON.stringify({ newPassword: password, token: resetPasswordToken })
		}).then(async (res) => {
			apiError = await handleApiResponse(res, async () => {
				goto('/user');
				open.set(false);
			});
		});
	};
</script>

<Modal titleString="Reset Password" isOpen={open} maxWidthPx={450}>
	<form class="col-start-1 row-start-1 px-1" on:submit|preventDefault={handleSubmit} novalidate>
		<label for="password" use:melt={$meltLabel}>New password</label>
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
</Modal>
