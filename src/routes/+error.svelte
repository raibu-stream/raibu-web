<script lang="ts">
	import { page } from '$app/stores';
</script>

<h2>{$page.status}</h2>
<p>{$page.error?.message}</p>
{#if $page.error?.errorId !== undefined}
	<small>{$page.error?.errorId}</small>
{/if}
