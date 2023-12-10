<script>
	let hidePassword = true;
	let hiderIsHovered = false;

	export let password = '';
	export let onInput = () => undefined;
	let isNew = false;
	export { isNew as new };
</script>

<div class="w-full input flex gap-4">
	<input
		class="grow"
		type={!hidePassword || hiderIsHovered ? 'text' : 'password'}
		required
		autocomplete={isNew ? 'new-password' : 'current-password'}
		id="password"
		on:input={(event) => {
			password = event.target.value;
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
