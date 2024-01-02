<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { dropdown } from '../stores';

	const signOut = async () => {
		return fetch('/user/session', {
			method: 'delete'
		}).then(async () => {
			await invalidateAll();
		});
	};
</script>

<ul class="flex flex-col gap-4 p-4">
	<li>
		<a class="link" href="/user">
			<i class="fa-solid fa-gauge" aria-hidden="true"></i>
			Dashboard
		</a>
	</li>
	<hr class="text-neutral-300" />
	<li>
		<button
			class="link"
			on:click={async () => {
				$dropdown = undefined;
				await signOut();
			}}
		>
			<i class="fa-solid fa-right-from-bracket" aria-hidden="true"></i>
			Sign out
		</button>
	</li>
</ul>
