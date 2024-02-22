<script lang="ts">
	import { quintOut } from 'svelte/easing';
	import { fade } from 'svelte/transition';
	import { modal } from '../../stores';
</script>

{#if $modal}
	<aside
		class="fixed inset-0 z-50 flex items-center justify-center"
		role="dialog"
		transition:fade={{ duration: 200, easing: quintOut }}
	>
		<section
			class="z-10 w-full max-w-[450px] border border-neutral-300 bg-secondary-800 p-6 text-left shadow-lg section:rounded"
			style:max-width="{$modal.maxWidthPx}px"
		>
			<div class="flex items-start justify-between">
				<h3 class="mb-6 border-b border-neutral-300 text-2xl font-medium tracking-tight">
					{$modal.title}
				</h3>
				<button
					on:click={() => ($modal = undefined)}
					class="text-2xl transition-colors duration-100 hover:text-primary-200"
				>
					<i class="fa-solid fa-xmark" title="Close" aria-hidden="true"></i>
					<span class="sr-only">Close</span>
				</button>
			</div>
			<div class="grid grid-cols-1 grid-rows-1 overflow-hidden">
				<svelte:component this={$modal.component} {...$modal.props}></svelte:component>
			</div>
		</section>
		<button
			class="fixed inset-0 w-full cursor-default bg-primary-400 bg-opacity-25"
			on:click={() => ($modal = undefined)}
		/>
	</aside>
{/if}

<svelte:head>
	{#if $modal}
		<style>
			body {
				overflow-y: hidden;
			}
		</style>
	{/if}
</svelte:head>
