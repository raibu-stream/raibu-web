<script lang="ts">
	import Modal from '$lib/components/Modal.svelte';

	export let errorText: string;
	export let trigger: any = undefined;
</script>

<Modal titleString="Error" maxWidthPx={600} bind:trigger>
	<pre
		class="max-h-96 w-full overflow-auto whitespace-pre-wrap break-words rounded bg-neutral-900 p-4 font-mono">
{errorText.replaceAll('\\n', '\n')}
</pre>
</Modal>
