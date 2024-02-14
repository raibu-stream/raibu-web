<script lang="ts">
	import HttpError from './httpError.svelte';
	import { page } from '$app/stores';
</script>

<HttpError page={$page} />
