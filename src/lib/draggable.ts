import type { Action } from 'svelte/action';
import { quintOut } from 'svelte/easing';
import { tweened } from 'svelte/motion';

type DroppableOptions = {
	onDrop: (data: string, node: HTMLElement) => void;
	onConsider: (data: string, node: HTMLElement) => void;
	onUnconsider: (data: string, node: HTMLElement) => void;
	selector: string;
};

const droppables = new Map<
	{
		element: HTMLElement;
		type?: string;
	},
	DroppableOptions
>();

const moveTo = (
	x: number,
	y: number,
	node: HTMLElement,
	rect: DOMRect,
	shiftX: number,
	shiftY: number
) => {
	node.style.left = `${x - shiftX - rect.left}px`;
	node.style.top = `${y - shiftY - rect.top}px`;
};

const overDroppable = (
	node: HTMLElement,
	x: number,
	y: number,
	ourType: string | undefined
): DroppableOptions | undefined => {
	node.hidden = true;
	const maybeDroppable = document.elementFromPoint(x, y);
	node.hidden = false;

	if (maybeDroppable === null) return undefined;

	let maybeDroppableOptions;
	droppables.forEach((value, key) => {
		if (key.type !== ourType) {
			return;
		}

		const droppable = maybeDroppable.closest(value.selector);
		if (droppable !== null) {
			maybeDroppableOptions = value;
		}
	});
	if (maybeDroppableOptions !== undefined) {
		return maybeDroppableOptions;
	}

	return undefined;
};

const getIntFromPx = (x: string) => {
	return Number(x.slice(0, -2));
};

const tweenResetPosition = async (
	node: HTMLElement,
	normalLeft: number,
	normalTop: number,
	normalPosition: string,
	onDragSettle?: (node: HTMLElement) => void
) => {
	const tweenedOptions = {
		duration: 500,
		easing: quintOut
	};
	const left = tweened(getIntFromPx(node.style.left), tweenedOptions);
	const top = tweened(getIntFromPx(node.style.top), tweenedOptions);
	const leftDone = left.set(normalLeft);
	const topDone = top.set(normalTop);

	const unsubscribeLeft = left.subscribe((left) => {
		node.style.left = `${left}px`;
	});

	const unsubscribeTop = top.subscribe((top) => {
		node.style.top = `${top}px`;
	});

	await leftDone;
	unsubscribeLeft();
	await topDone;
	unsubscribeTop();

	node.style.position = normalPosition;
	if (onDragSettle !== undefined) {
		onDragSettle(node);
	}
};

export const draggable: Action<
	HTMLElement,
	{
		indentifier: string;
		onDragStart?: (node: HTMLElement) => void;
		onDragEnd?: (node: HTMLElement) => void;
		onDragSuccessfulDrop?: (node: HTMLElement) => void;
		onDragSettle?: (node: HTMLElement) => void;
		type?: string;
	}
> = (node, data) => {
	const normalCursor = node.style.cursor;
	const normalPosition = node.style.position;
	const normalLeft = node.style.left;
	const normalTop = node.style.top;
	const normalDocumentUserSelect = document.body.style.userSelect;
	const rect = node.getBoundingClientRect();

	node.style.cursor = 'grab';

	let handleMouseMove: (event: MouseEvent) => void | undefined;
	let currentConsidering: DroppableOptions | undefined;

	const reset = () => {
		node.style.cursor = 'grab';
		document.body.style.userSelect = normalDocumentUserSelect;

		tweenResetPosition(
			node,
			getIntFromPx(normalLeft),
			getIntFromPx(normalTop),
			normalPosition,
			data.onDragSettle
		).catch((err) => {
			console.warn(err);

			node.style.position = normalPosition;
			node.style.left = normalLeft;
			node.style.top = normalTop;

			if (data.onDragSettle !== undefined) {
				data.onDragSettle(node);
			}
		});

		document.removeEventListener('mouseup', handleMouseUp);
		document.removeEventListener('mousemove', handleMouseMove);
	};

	const handleMouseUp = (event: MouseEvent) => {
		if (data.onDragEnd !== undefined) {
			data.onDragEnd(node);
		}

		const maybeDroppableOptions = overDroppable(node, event.clientX, event.clientY, data.type);
		if (maybeDroppableOptions?.onUnconsider !== undefined) {
			maybeDroppableOptions.onUnconsider(data.indentifier, node);
		}
		if (maybeDroppableOptions?.onDrop !== undefined) {
			if (data.onDragSuccessfulDrop !== undefined) {
				data.onDragSuccessfulDrop(node)
			}
			maybeDroppableOptions.onDrop(data.indentifier, node);
		}

		reset();
	};

	const handleMouseDown = (event: MouseEvent) => {
		currentConsidering = undefined;

		if (data.onDragStart !== undefined) {
			data.onDragStart(node);
		}

		const shiftX = event.clientX - rect.left;
		const shiftY = event.clientY - rect.top;

		document.body.style.userSelect = 'none';
		node.style.position = 'relative';
		node.style.cursor = 'grabbing';
		moveTo(event.pageX, event.pageY, node, rect, shiftX, shiftY);

		handleMouseMove = (event: MouseEvent) => {
			moveTo(event.pageX, event.pageY, node, rect, shiftX, shiftY);

			const maybeDroppableOptions = overDroppable(node, event.clientX, event.clientY, data.type);
			if (
				maybeDroppableOptions?.onConsider !== undefined &&
				maybeDroppableOptions?.selector !== currentConsidering?.selector
			) {
				maybeDroppableOptions.onConsider(data.indentifier, node);
			} else if (
				currentConsidering?.onUnconsider !== undefined &&
				maybeDroppableOptions?.selector !== currentConsidering?.selector
			) {
				currentConsidering.onUnconsider(data.indentifier, node);
			}
			currentConsidering = maybeDroppableOptions;
		};
		document.addEventListener('mousemove', handleMouseMove);
		document.addEventListener('mouseup', handleMouseUp);
	};

	node.addEventListener('mousedown', handleMouseDown);

	return {
		update: (newData) => {
			data = newData;
		},
		destroy: () => {
			node.removeEventListener('mousedown', handleMouseDown);
			node.removeEventListener('mouseup', handleMouseUp);
			reset();
			node.style.cursor = normalCursor;
		}
	};
};

export const dropzone: Action<HTMLElement, DroppableOptions & { type?: string }> = (
	node,
	options
) => {
	droppables.set({ element: node, type: options.type }, options);

	return {
		update: (newOptions) => {
			options = newOptions;
			droppables.set({ element: node, type: newOptions.type }, newOptions);
		},
		destroy: () => {
			droppables.delete({ element: node, type: options.type });
		}
	};
};
