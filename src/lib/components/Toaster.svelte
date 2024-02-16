<script lang="ts">
	import { Toaster } from 'svelte-sonner';

	const toastClasses = {
		toast:
			'bg-neutral-900 w-full flex items-start p-5 rounded-md gap-2 group text-left sonner-toast',
		title: 'font-semibold',
		description: 'text-sm',
		closeButton: '!bg-neutral-100 !text-neutral-900 !hidden group-hover:!flex'
	};
</script>

<Toaster
	theme="dark"
	closeButton
	toastOptions={{
		unstyled: true,
		classes: toastClasses
	}}
>
	<i class="fa-solid fa-circle-check text-lg" aria-hidden="true" slot="success-icon"></i>
	<i class="fa-solid fa-circle-exclamation text-lg" aria-hidden="true" slot="error-icon"></i>
	<i class="fa-solid fa-circle-info text-lg" aria-hidden="true" slot="info-icon"></i>
	<i class="fa-solid fa-triangle-exclamation text-lg" aria-hidden="true" slot="warning-icon"></i>
</Toaster>
