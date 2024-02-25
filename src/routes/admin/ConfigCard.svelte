<script lang="ts">
	import Switch from '$lib/components/Switch.svelte';
	import { onMount } from 'svelte';

	export let title: string;
	export let defaultEnabled: boolean = false;
	export let onDisable: (() => void) | undefined = undefined;

	let enabled: any;
	let hasDisabledOnce = false;

	onMount(() => {
		if (onDisable !== undefined) {
			enabled.subscribe((val: boolean) => {
				if (!val && hasDisabledOnce) {
					onDisable!();
				}
				hasDisabledOnce = true;
			});
		}
	});
</script>

<li
	class="h-full rounded bg-secondary-700 p-6 shadow-lg transition"
	class:brightness-75={!$enabled}
>
	<div class="mb-4 flex items-center justify-between">
		<h4 class="text-lg font-semibold">{title}</h4>
		<div class:brightness-125={!$enabled}>
			<Switch bind:checked={enabled} defaultChecked={defaultEnabled} />
		</div>
	</div>
	<slot enabled={$enabled} />
</li>
