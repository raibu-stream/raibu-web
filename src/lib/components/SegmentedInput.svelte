<script lang="ts">
	let inputs: HTMLInputElement[] = [];

	const onKeydown = (
		event: KeyboardEvent & { currentTarget: EventTarget & HTMLInputElement },
		index: number
	) => {
		if (event.keyCode === 8 && event.currentTarget.value === '' && index > 0) {
			inputs[index - 1].focus();
		}
	};

	const onInput = (eventUnknown: unknown, index: number) => {
		const event = eventUnknown as InputEvent & {
			currentTarget: EventTarget & HTMLInputElement;
		};
		if (event.data === null || event.data === '') {
			event.currentTarget.value = '';
			value = inputs.map((input) => input.value).join('');
			isFull = inputs.every((input) => input.value !== '');
			return;
		}
		const [first, ...rest] = event.data;
		event.currentTarget.value = first;

		if (first !== undefined && first !== null && index !== 5) {
			inputs[index + 1].focus();
			rest.slice(0, 5 - index).forEach((character: string, restIndex: number, rest: string[]) => {
				inputs[index + 1 + restIndex].value = character;
				if (rest.length - 1 === restIndex) {
					let focusIndex = index + 2 + restIndex >= 5 ? 5 : index + 2 + restIndex;
					inputs[focusIndex].focus();
				}
			});
		}

		value = inputs.map((input) => input.value).join('');
		isFull = inputs.every((input) => input.value !== '');
	};

	export let value = '';
	export let isFull = false;
</script>

<fieldset class="flex gap-3 text-xl sm:gap-4 sm:text-2xl">
	<!-- eslint-disable-next-line @typescript-eslint/no-unused-vars -->
	{#each { length: 6 } as _, index}
		<input
			name="code"
			class="h-12 w-10 rounded-xl bg-secondary-800 text-center sm:h-16 sm:w-14"
			type="text"
			inputmode="numeric"
			autocomplete="off"
			bind:this={inputs[index]}
			on:input={(event) => onInput(event, index)}
			on:keydown={(event) => onKeydown(event, index)}
		/>
	{/each}
</fieldset>
