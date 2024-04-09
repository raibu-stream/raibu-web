<script lang="ts">
	import Streams from './Streams.svelte';
	import type { PageServerData } from './$types';
	import PasswordInput from '$lib/components/PasswordInput.svelte';
	import { meltLabel } from '$lib/utils';
	import { melt } from '@melt-ui/svelte';
	import Modal from '$lib/components/Modal.svelte';
	import { goto } from '$app/navigation';
	import SvelteSeo from 'svelte-seo';

	export let data: PageServerData;
</script>

<SvelteSeo title="Dashboard | Raibu" />

<div class="my-10 w-full max-w-section-breakout">
	<h2 class="text-left text-4xl font-bold tracking-tight">Account</h2>
</div>

<section class="section mb-6 flex items-center gap-4">
	<button
		class="flex h-14 w-14 items-center justify-center rounded-full border border-transparent bg-primary-400 text-2xl font-semibold uppercase leading-none text-neutral-100 transition-colors duration-100"
	>
		{data.email[0]}
	</button>
	<div class="flex flex-col">
		<span>{data.email}</span>
		<small class="text-neutral-200">
			{#if data.tier !== undefined}
				{#if data.tier.name !== null}
					{data.tier.name}
				{:else}
					{data.tier.allottedConcurrentStreams} streams with {data.tier.allottedConcurrentViewers} viewers
					@ {data.tier.allottedBitrateInKbps} kbps
				{/if}
			{:else}
				No tier selected. <a class="underline" href="/user/subscribe">Let's change that.</a>
			{/if}
		</small>
	</div>
</section>

<section class="section mb-6">
	<div class="mb-6">
		<h3 class="mb-1 border-b-0 text-3xl font-bold tracking-tight">Account Settings</h3>
		<small class="text-neutral-200">Here you can change your account information</small>
	</div>
	<form>
		<label for="email" use:melt={$meltLabel}>Email</label>
		<div class="mb-6 mt-2">
			<input type="email" id="email" class="input w-full sm:w-1/2" />
		</div>
		<button class="button float-right px-8 text-base">Update</button>
	</form>
</section>

<section class="section mb-6">
	<div class="mb-6">
		<h3 class="mb-1 border-b-0 text-3xl font-bold tracking-tight">Change Password</h3>
		<small class="text-neutral-200">Here you can change your password</small>
	</div>
	<form>
		<div class="mb-6 flex flex-col gap-2 sm:flex-row">
			<div class="grow">
				<label for="password" use:melt={$meltLabel}>Old Password</label>
				<div class="mt-2">
					<PasswordInput />
				</div>
			</div>
			<div class="grow">
				<label for="password" use:melt={$meltLabel}>New Password</label>
				<div class="mt-2">
					<PasswordInput new />
				</div>
			</div>
		</div>
		<button class="button float-right px-8 text-base">Update</button>
	</form>
</section>

<section class="flex w-full max-w-section flex-col items-center">
	<div class="section h-52">
		<div class="mb-6">
			<h3 class="mb-1 border-b-0 text-3xl font-bold tracking-tight">Streams</h3>
			<small class="text-neutral-200">Here you can create and manage your streams</small>
		</div>
	</div>
	<Streams />
</section>

<Modal
	titleString="You have no tier selected!"
	type="alertdialog"
	defaultOpen={data.tier === undefined}
	maxWidthPx={600}
	let:close
>
	<p class="mb-8">Subscribe to a tier to start streaming!</p>
	<div class="flex justify-end gap-3">
		<button class="button" use:melt={close} on:m-click={() => goto('/user/subscribe')}>
			Go to checkout
		</button>
		<button class="button button-invert" use:melt={close}>Later</button>
	</div>
</Modal>

<style lang="postcss">
	.section {
		@apply w-full max-w-screen-section bg-secondary-800 p-6 text-left shadow-lg section:rounded;
	}
</style>
