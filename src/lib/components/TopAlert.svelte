<script lang="ts">
	import { onMount } from 'svelte';

	export let topAlert: { id: string; message: string };
	export let alertDismissed = true;

	$: message = parseMarkdownLinks(topAlert.message);
	const parseMarkdownLinks = (input: string): (string | { href: string; display: string })[] => {
		let message = [];
		let link: RegExpExecArray | null;
		while ((link = /(\[([^\]]+)])\(([^)]+)\)/g.exec(input)) != null) {
			message.push(input.slice(0, link.index));
			let display = link[2];
			let href = link[3];
			message.push({ display, href });
			input = input.slice(link.index + href.length + display.length + 4);
		}
		message.push(input);

		return message;
	};

	onMount(() => {
		let storedDismissedMessage = localStorage.getItem(topAlert.id + '_topAlert');
		alertDismissed = storedDismissedMessage === 'true';
	});
</script>

{#if !alertDismissed}
	<div
		class="sticky top-0 z-30 flex h-10 items-center justify-center border-b border-neutral-300 bg-primary-400 px-6 transition-all"
	>
		<p class="ml-auto">
			{#each message as part}
				{#if typeof part === 'string'}
					{part}
				{:else}
					<a href={part.href} target="_blank" class="underline">{part.display}</a>
				{/if}
			{/each}
		</p>
		<button
			class="ml-auto"
			on:click={() => {
				alertDismissed = true;
				localStorage.setItem(topAlert.id + '_topAlert', 'true');
			}}
		>
			<i class="fa-solid fa-x"></i>
			<span class="sr-only">close alert</span>
		</button>
	</div>
{/if}
