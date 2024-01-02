<script lang="ts">
	let hidePassword = true;
	let hiderIsHovered = false;

	export let password = '';
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	export let onInput = (_: Event) => undefined;
	let isNew = false;
	export { isNew as new };
</script>

<div class="input flex w-full gap-4">
	<input
		class="grow"
		type={!hidePassword || hiderIsHovered ? 'text' : 'password'}
		required
		autocomplete={isNew ? 'new-password' : 'current-password'}
		id="password"
		on:input={(event) => {
			password = event.currentTarget.value;
			onInput(event);
		}}
	/>
	<small>
		<button
			type="button"
			on:click={() => (hidePassword = !hidePassword)}
			on:mouseenter={() => (hiderIsHovered = true)}
			on:mouseleave={() => (hiderIsHovered = false)}
		>
			<i aria-hidden="true" class="fa-solid {hidePassword ? 'fa-eye' : 'fa-eye-slash'} w-4"></i>
			<span class="sr-only">{hidePassword ? 'Show password' : 'Hide password'}</span>
		</button>
	</small>
</div>
