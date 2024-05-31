<script lang="ts">
	import { createDropdownMenu, melt } from '@melt-ui/svelte';

	type DropdownMenu = ReturnType<typeof createDropdownMenu>['elements']['menu'];
	export let menu: DropdownMenu;
</script>

<div
	class="z-40 flex max-h-72 min-w-48 flex-col gap-1 rounded-md bg-secondary-800 p-1.5 shadow-lg shadow-neutral-900/30 lg:max-h-none"
	use:melt={$menu}
>
	<slot />
</div>
