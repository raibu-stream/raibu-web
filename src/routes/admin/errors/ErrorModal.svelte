<script lang="ts">
	export let errorText: string;
</script>

<pre class="max-h-96 w-full overflow-auto rounded bg-neutral-900 p-4 font-mono">
{errorText.replaceAll('\\n', '\n')}
</pre>
