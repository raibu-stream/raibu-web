<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { handleApiResponse } from '$lib/utils.js';
	import { dropdown } from '../../../stores';
	import type { user as userSchema } from '$lib/models/schema';
	import type { InferSelectModel } from 'drizzle-orm';
	import { toast } from 'svelte-sonner';
	import type { User } from 'lucia';

	export let user: InferSelectModel<typeof userSchema>;

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
</script>

<ul class="flex flex-col gap-2 p-4">
	{#if user.isAdmin}
		<li>
			<button class="link" on:click={() => patch({ isAdmin: false })}>Remove admin</button>
		</li>
	{:else}
		<li>
			<button class="link" on:click={() => patch({ isAdmin: true })}>Make admin</button>
		</li>
	{/if}
	{#if user.isEmailVerified}
		<li>
			<button class="link" on:click={() => patch({ isEmailVerified: false })}>
				Unverify email
			</button>
		</li>
	{:else}
		<li>
			<button class="link" on:click={() => patch({ isEmailVerified: true })}>Verify email</button>
		</li>
	{/if}

	{#if user.isLocked}
		<li>
			<button class="link" on:click={() => patch({ isLocked: false })}>Unlock</button>
		</li>
	{/if}

	<li>
		<button class="link" on:click={deleteUser}>Delete</button>
	</li>
</ul>
