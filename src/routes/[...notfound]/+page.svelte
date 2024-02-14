<script lang="ts">
	import HttpError from '../httpError.svelte';
</script>

<HttpError
	page={{
		status: 404,
		error: {
			message: 'Not found'
		}
	}}
/>
