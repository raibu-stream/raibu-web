<script lang="ts">
	import Dropdown from '$lib/components/Dropdown.svelte';
	import DropdownItem from '$lib/components/DropdownItem.svelte';
	import { createDropdownMenu, melt } from '@melt-ui/svelte';
	import type { PageData } from './$types';
	import { invalidateAll } from '$app/navigation';
	import { handleApiResponse } from '$lib/utils.js';
	import { dropdown } from '../../../stores';
	import { toast } from 'svelte-sonner';
	import type { User } from 'lucia';
	import { writable } from 'svelte/store';
	import DropdownSeparator from '$lib/components/DropdownSeparator.svelte';

	export let user: PageData['users'][0];

	// eslint-disable-next-line no-undef
	const patch = (update: Partial<User>) => {
		$dropdown = undefined;

		toast.promise(
			fetch('/admin/users', {
				method: 'PATCH',
				body: JSON.stringify({ update: update, userId: user.id })
			}).then(async (res) => {
				const maybeError = await handleApiResponse(res, async () => {
					invalidateAll();
				});

				if (maybeError !== undefined) {
					throw maybeError;
				}
			}),
			{
				loading: 'Loading...',
				success: 'Updated!',
				error: 'An error occurred.'
			}
		);
	};

	const deleteUser = () => {
		$dropdown = undefined;

		toast.promise(
			fetch('/admin/users', {
				method: 'DELETE',
				body: JSON.stringify({ userId: user.id })
			})
				.then(async (res) => {
					return handleApiResponse(res, async () => {
						invalidateAll();
					});
				})
				.then((res) => {
					if (res !== undefined) {
						toast.error(res);
					}
				}),
			{
				loading: 'Loading...',
				success: 'Deleted!',
				error: 'An error occurred.'
			}
		);
	};

	const {
		elements: { menu, item, trigger, separator },
		builders: { createCheckboxItem }
	} = createDropdownMenu();

	const isEmailVerified = writable(user.isEmailVerified);
	$: $isEmailVerified = user.isEmailVerified;
	const {
		elements: { checkboxItem: emailVerificationCheckboxItem }
	} = createCheckboxItem({
		checked: isEmailVerified
	});

	const isAdmin = writable(user.isAdmin);
	$: $isAdmin = user.isAdmin;
	const {
		elements: { checkboxItem: isAdminCheckboxItem }
	} = createCheckboxItem({
		checked: isAdmin
	});
</script>

<tr class="h-12 overflow-visible border-t-2 border-neutral-300">
	<td class="pl-6">
		{user.id}
	</td>
	<td>
		{user.isEmailVerified}
	</td>
	<td>
		{user.isLocked}
	</td>
	<td class="pl-10">
		{user.isAdmin}
	</td>
	<td class="pr-6">
		<button class="text-lg" use:melt={$trigger}>
			<i class="fa-solid fa-angle-down" aria-hidden="true"></i>
			<span class="sr-only">toggle menu</span>
		</button>
	</td>
</tr>

<Dropdown {menu}>
	<DropdownItem item={isAdminCheckboxItem} on:click={() => patch({ isAdmin: !$isAdmin })}>
		{#if $isAdmin}
			Remove admin
		{:else}
			Make admin
		{/if}

		<span slot="icon" aria-hidden="true">
			{#if $isAdmin}
				<i class="fa-solid fa-check"></i>
			{/if}
		</span>
	</DropdownItem>
	<DropdownItem
		item={emailVerificationCheckboxItem}
		on:click={() => patch({ isEmailVerified: !$isEmailVerified })}
	>
		{#if $isEmailVerified}
			Unverify email
		{:else}
			Verify email
		{/if}

		<span slot="icon" aria-hidden="true">
			{#if $isEmailVerified}
				<i class="fa-solid fa-check"></i>
			{/if}
		</span>
	</DropdownItem>
	{#if user.isLocked}
		<DropdownItem {item} on:click={() => patch({ isLocked: false })}>Unlock</DropdownItem>
	{/if}
	<DropdownSeparator {separator} />
	<DropdownItem {item} on:click={deleteUser}>Delete</DropdownItem>
</Dropdown>

<style lang="postcss">
	td {
		@apply max-w-[10rem] overflow-hidden overflow-ellipsis whitespace-nowrap pr-4;
	}
</style>
