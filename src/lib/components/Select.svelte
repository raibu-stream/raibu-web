<script lang="ts">
	import { quintOut } from 'svelte/easing';
	import { slide } from 'svelte/transition';
	import { createSelect, melt, type CreateSelectProps } from '@melt-ui/svelte';

	export let inputLabel: string;
	export let defaultOpen = false;
	export let selected: CreateSelectProps['selected'] = undefined;
	export let placeholder: string;
	export let required = false;
	export let onChange: CreateSelectProps['onSelectedChange'] = undefined;
	export let zIndex = 0;

	const {
		elements: { trigger, menu, option, label },
		states: { open, selected: selectedValue, selectedLabel },
		helpers: { isSelected }
	} = createSelect({
		forceVisible: true,
		positioning: {
			placement: 'bottom',
			sameWidth: true
		},
		onSelectedChange: onChange,
		selected,
		required,
		defaultOpen
	});

	let classNames = '';
	export { trigger, open, classNames as class, selectedValue };
</script>

<!-- svelte-ignore a11y-label-has-associated-control - $label contains the 'for' attribute -->
<label use:melt={$label}>{inputLabel}</label>
<button
	class="input mt-2 flex min-w-40 items-center justify-between gap-1 whitespace-nowrap {classNames}"
	use:melt={$trigger}
>
	<span class="truncate pr-4 text-left">{$selectedLabel || placeholder}</span>
	<i class="fa-solid fa-chevron-down" aria-hidden="true"></i>
</button>
{#if $open}
	<div
		class="max-h-72 overflow-y-auto rounded-sm bg-secondary-700 p-1 text-neutral-100 shadow focus:!ring-0"
		style:z-index={zIndex}
		use:melt={$menu}
		transition:slide={{ duration: 200, easing: quintOut }}
	>
		<slot option={$option} isSelected={$isSelected} />
	</div>
{/if}
