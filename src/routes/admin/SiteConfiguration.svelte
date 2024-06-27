<script lang="ts">
	import { melt } from '@melt-ui/svelte';
	import ConfigCard from './ConfigCard.svelte';
	import { disableSignupId, handleApiResponse, meltLabel, topAlertId } from '$lib/utils';
	import { slide } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';
	import { toast } from 'svelte-sonner';
	import { v4 as uuidV4 } from 'uuid';
	import FormError from '$lib/components/FormError.svelte';
	import type { PageData } from './$types';
	import { invalidateAll } from '$app/navigation';

	export let configs: PageData['configs'];
	configs.then((configs) => {
		const config = configs.reduce((configs: Record<string, string | null>, config) => {
			configs[config.id] = config.value;

			return configs;
		}, {});

		if (config[topAlertId] !== undefined && config[topAlertId] !== null) {
			let alert = JSON.parse(config[topAlertId]);
			alertId = alert.id;
			alertMessage = alert.message;
		}

		if (config[disableSignupId] !== undefined && config[disableSignupId] !== null) {
			signupMessage = config[disableSignupId];
		}
	});

	let alertMessage = '';
	let alertId = '';
	let signupMessage = '';

	let alertMessageError: string | undefined;
	let signupMessageError: string | undefined;

	const updateConfig = (id: string, update: string | null, onSuccess?: () => Promise<void>) => {
		toast.promise(
			fetch('/admin/site-config', {
				method: 'PUT',
				body: JSON.stringify({ update, id })
			}).then(async (res): Promise<void> => {
				const maybeError = await handleApiResponse(res, onSuccess);

				if (maybeError !== undefined) {
					throw maybeError;
				}
			}),
			{
				loading: 'Loading...',
				success: 'Updated!',
				error: (err) => (typeof err === 'string' ? err : 'An unexpected error occured')
			}
		);
	};
</script>

{#await configs}
	<div class="flex justify-center">
		<i class="fa-solid fa-circle-notch animate-spin" aria-hidden="true"></i>
		<span class="sr-only">Loading</span>
	</div>
	<!-- eslint-disable-next-line @typescript-eslint/no-unused-vars -->
{:then _}
	<ul class="flex flex-col gap-4">
		<ConfigCard
			title="Top Alert"
			defaultEnabled={alertMessage !== ''}
			onDisable={async () => {
				alertMessage = '';
				alertId = '';
				alertMessageError = undefined;
				updateConfig(topAlertId, null, invalidateAll);
			}}
			let:enabled
		>
			<div class="flex flex-col justify-between gap-6 sm:flex-row">
				<div class="flex min-w-0 flex-col items-center sm:mb-4 sm:items-start">
					<div
						class="relative mb-4 flex aspect-video w-full min-w-44 max-w-60 origin-top-left flex-col items-center overflow-hidden rounded"
						aria-hidden="true"
					>
						{#if enabled}
							<div
								class="absolute inset-0 bottom-auto flex h-6 w-full items-center justify-between bg-primary-400 px-2 text-[0.55rem]"
								transition:slide={{ duration: 350, easing: quintOut }}
							>
								<p class="pr-8">
									<span class="bg-primary-200 text-primary-200">
										{'█'.repeat(Math.min(alertMessage.length, 30))}
									</span>
								</p>
								<i class="fa-solid fa-x"></i>
							</div>
						{/if}
						<div class="absolute inset-0 rounded border-2 border-secondary-700"></div>
						<div class="absolute inset-0 rounded border-2 border-neutral-300"></div>
						<div class="mb-2 h-10 w-full bg-neutral-900" />
						<div class="flex h-1/2 w-2/3 gap-2">
							<div class="h-full grow rounded bg-neutral-300"></div>
							<div>
								<div class="mb-2 size-8 rounded bg-neutral-300"></div>
								<div class="size-8 rounded bg-neutral-300"></div>
							</div>
						</div>
					</div>
					<p class="text-center text-sm sm:text-left">Display a top&nbsp;alert on all pages</p>
				</div>
				<form
					novalidate
					on:submit|preventDefault={() => {
						alertMessageError = undefined;
						if (alertMessage === '') {
							alertMessageError = 'Message is required';
							return;
						}

						updateConfig(
							topAlertId,
							JSON.stringify({
								id: alertId === '' ? uuidV4() : alertId,
								message: alertMessage
							}),
							invalidateAll
						);
					}}
					class="w-full text-right sm:max-w-[50%]"
				>
					<div class="mb-6 text-left">
						<label for="alert-message" use:melt={$meltLabel}>Message</label>
						<div class="mb-4">
							<input
								id="alert-message"
								required
								class="input mt-2 w-full !bg-secondary-800"
								disabled={!enabled}
								bind:value={alertMessage}
							/>
							<small class="text-neutral-200">Hint: you can use markdown style links</small>
							{#if alertMessageError !== undefined}
								<FormError class="mt-2">{alertMessageError}</FormError>
							{/if}
						</div>
						<label for="alert-id" use:melt={$meltLabel}>ID (Optional)</label>
						<input
							id="alert-id"
							disabled={!enabled}
							class="input mt-2 w-full !bg-secondary-800"
							bind:value={alertId}
						/>
					</div>
					<button class="button" disabled={!enabled}>Save</button>
				</form>
			</div>
		</ConfigCard>
		<ConfigCard
			title="Disable Sign Up"
			defaultEnabled={signupMessage !== ''}
			onDisable={() => {
				signupMessageError = undefined;
				signupMessage = '';
				updateConfig(disableSignupId, null);
			}}
			let:enabled
		>
			<div class="flex flex-col justify-between gap-6 sm:flex-row">
				<div class="flex min-w-0 flex-col items-center sm:mb-4 sm:items-start">
					<div
						class="relative mb-4 flex aspect-video w-full min-w-44 max-w-60 origin-top-left flex-col items-center overflow-hidden rounded sm:mb-4"
						aria-hidden="true"
					>
						<div class="absolute inset-0 rounded border-2 border-secondary-700"></div>
						<div class="absolute inset-0 rounded border-2 border-neutral-300"></div>
						<div class="flex size-full">
							<div class="size-full max-w-18 bg-neutral-300 p-2 leading-[0]">
								<div class="mb-2">
									<div class="mb-1 h-1 w-1/2 bg-neutral-300"></div>
									<div class="h-3 w-full rounded-sm bg-neutral-300"></div>
								</div>
								<div class="mb-2">
									<div class="mb-1 h-1 w-2/3 bg-neutral-300"></div>
									<div class="h-3 w-full rounded-sm bg-neutral-300"></div>
								</div>
								<div class="mb-1 flex w-full justify-center">
									<div class="h-2 w-2/3 rounded-sm bg-neutral-300"></div>
								</div>
								<span
									class="break-words bg-primary-200 text-[0.25rem] leading-[0] text-primary-200"
								>
									{'█'.repeat(Math.min(signupMessage.length, 33))}
								</span>
							</div>
							<div></div>
						</div>
					</div>
					<p class="text-center text-sm sm:text-left">Disallow any new sign ups with a message</p>
				</div>
				<form
					novalidate
					on:submit|preventDefault={() => {
						signupMessageError = undefined;
						if (signupMessage === '') {
							signupMessageError = 'Message is required';
							return;
						}

						updateConfig(disableSignupId, signupMessage);
					}}
					class="w-full text-right sm:max-w-[50%]"
				>
					<div class="mb-4 text-left">
						<label for="signup-message" use:melt={$meltLabel}>Message</label>
						<div class="mb-4">
							<input
								id="signup-message"
								required
								disabled={!enabled}
								class="input mt-2 w-full !bg-secondary-800"
								bind:value={signupMessage}
							/>
							{#if signupMessageError !== undefined}
								<FormError class="mt-2">{signupMessageError}</FormError>
							{/if}
						</div>
					</div>
					<button class="button" disabled={!enabled}>Save</button>
				</form>
			</div>
		</ConfigCard>
	</ul>
{/await}

<style lang="postcss">
	.section {
		@apply w-full max-w-screen-section bg-secondary-800 p-6 text-left shadow-lg section:rounded;
	}
</style>
