<script>
	import { goto } from '$app/navigation';
	import FormError from './FormError.svelte';
	import Modal from './Modal.svelte';
	import PasswordInput from './PasswordInput.svelte';

	export let loginModalOn;

	let password;
	let email;

	let apiError;
	let request;

	const handleSubmit = async () => {
		apiError = undefined;

		request = fetch('/user/session', {
			method: 'post',
			body: JSON.stringify({ email, password })
		}).then(async (res) => {
			if (res.statusText === 'OK') {
				goto('/user');
				loginModalOn = false;
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

{#if loginModalOn}
	<Modal title="Log in" closeModal={() => (loginModalOn = false)}>
		<form on:submit|preventDefault={handleSubmit}>
			<div class="flex justify-between items-center">
				<label class="text-lg" for="email">Email</label>
				<small>
					New to Raibu?
					<button type="button" on:click={() => (loginModalOn = false)}>
						<a class="underline" href="/signup">Sign up</a>
					</button>
				</small>
			</div>
			<input class="w-full mt-2 mb-8 input" type="email" required id="email" bind:value={email} />
			<label class="text-lg" for="password">Password</label>
			<div class="mt-2 mb-12">
				<PasswordInput bind:password />
			</div>

			<button class="button w-full !text-lg mb-4">
				{#await request}
					<i class="fa-solid fa-circle-notch animate-spin" aria-hidden="true"></i>
					<span class="sr-only">Loading</span>
					<!-- eslint-disable-next-line no-unused-vars -->
				{:then _}
					Log in
				{/await}
			</button>
			{#if apiError !== undefined}
				<FormError>{apiError}</FormError>
			{/if}
		</form>
	</Modal>
{/if}
