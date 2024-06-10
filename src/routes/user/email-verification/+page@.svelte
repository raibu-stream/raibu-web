<script lang="ts">
	import { slide } from 'svelte/transition';
	import FormError from '$lib/components/FormError.svelte';
	import SegmentedInput from '$lib/components/SegmentedInput.svelte';
	import { handleApiResponse } from '$lib/utils.js';
	import { goto } from '$app/navigation';
	import type { PageServerData } from './$types';
	import type { Readable } from 'svelte/store';
	import SvelteSeo from 'svelte-seo';

	export let data: PageServerData;

	let timer = 60;
	let timerInterval: NodeJS.Timeout | undefined = undefined;

	const apiSuccessfulMessage =
		'Your verification email has been sent successfully. Please check your spam folder. It will expire in 30 minutes.';

	let apiError = data.isPreSent ? apiSuccessfulMessage : undefined;
	let resendRequest: Promise<unknown> | undefined;
	let verifyRequest: Promise<unknown>;

	let code: Readable<string>;
	let isCodeReady: boolean;

	if (data.isPreSent) {
		const url = new URL(window.location.toString());
		url.searchParams.delete('pre-sent');
		history.replaceState({}, '', url);
	}

	const resendVerificationEmail = async () => {
		apiError = undefined;
		resendRequest = fetch('/user/email-verification/code', {
			method: 'post'
		}).then(async (res) => {
			let error = await handleApiResponse(res, () => {
				apiError = apiSuccessfulMessage;
				timer = 60;
				timerInterval = setInterval(() => {
					timer -= 1;

					if (timer === 0) {
						clearInterval(timerInterval);
						resendRequest = undefined;
						timerInterval = undefined;
						return;
					}
				}, 1000);
			});

			if (error !== undefined) {
				apiError = error;
			}
		});
	};

	const handleSubmit = async () => {
		if (!isCodeReady) {
			return;
		}
		apiError = undefined;

		verifyRequest = fetch('/user/email-verification/verify', {
			method: 'post',
			body: JSON.stringify({ code: $code })
		}).then(async (res) => {
			apiError = await handleApiResponse(res, async () => {
				if (data.redirectTo !== null) {
					goto(`/${data.redirectTo.slice(1)}`);
				} else {
					goto('/user');
				}
			});
		});
	};
</script>

<SvelteSeo title="Verify Your Email | Raibu" />

<div class="flex w-full grow items-center justify-center">
	<div class="flex max-w-lg flex-col items-center gap-2 p-2">
		<h2 class="text-xl font-semibold">Email verification</h2>
		<p class="italic leading-6 tracking-tight text-neutral-200">
			Please verify your email by entering the verification code sent to <span
				class="font-semibold not-italic text-neutral-100">{data.email}</span
			>.
		</p>
		<form on:submit|preventDefault={handleSubmit} class="my-5">
			<SegmentedInput bind:value={code} bind:isFull={isCodeReady} />
			<button class="button button-invert mt-4 w-full text-lg" disabled={!isCodeReady}>
				{#await verifyRequest}
					<i class="fa-solid fa-circle-notch animate-spin" aria-hidden="true"></i>
					<span class="sr-only">Loading</span>
					<!-- eslint-disable-next-line @typescript-eslint/no-unused-vars -->
				{:then _}
					Submit
				{/await}
			</button>
		</form>
		<div class="mt-2 text-sm">
			Email not received?
			<button
				class="font-semibold disabled:text-neutral-200"
				on:click={resendVerificationEmail}
				disabled={timerInterval !== undefined}
			>
				Resend email
			</button>
			{#if resendRequest !== undefined}
				<span transition:slide>
					{#await resendRequest}
						<i class="fa-solid fa-circle-notch animate-spin" aria-hidden="true"></i>
						<span class="sr-only">Loading</span>
						<!-- eslint-disable-next-line @typescript-eslint/no-unused-vars -->
					{:then _}
						- {timer}s
					{/await}
				</span>
			{/if}
		</div>

		{#if apiError}
			<FormError class="mt-2">{apiError}</FormError>
		{/if}
	</div>
</div>
