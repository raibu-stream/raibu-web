<script lang="ts">
	import { createDropdownMenu, melt } from '@melt-ui/svelte';
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

	type DropdownMenu = ReturnType<typeof createDropdownMenu>['elements']['item'];
	export let item: DropdownMenu;
</script>

<div
	class="relative z-20 flex h-6 min-h-7 select-none items-center rounded-sm pr-1 text-sm text-neutral-100 data-[highlighted]:bg-neutral-300 data-[disabled]:text-neutral-200"
	use:melt={$item}
	on:m-click={(e) => dispatch('click', e)}
>
	<div class="flex min-w-7 items-center justify-center text-center"><slot name="icon" /></div>
	<slot />
</div>
