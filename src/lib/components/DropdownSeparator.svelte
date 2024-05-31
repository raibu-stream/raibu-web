<script lang="ts">
	import { createDropdownMenu, melt } from '@melt-ui/svelte';

	type DropdownMenu = ReturnType<typeof createDropdownMenu>['elements']['separator'];
	export let separator: DropdownMenu;
</script>

<div class="m-1 h-px bg-neutral-300" use:melt={$separator}></div>
