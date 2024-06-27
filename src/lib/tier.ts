import { z } from 'zod';

export type Tier = {
	maxConcurrentStreams: 1 | 2 | 3 | 6;
	maxConcurrentViewers: 80 | 125 | 200 | 300 | 500 | 800;
	maxBitrateInKbps: 3000 | 6000 | 8000;
};

export const zTier = z.object({
	maxConcurrentStreams: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(6)]),
	maxConcurrentViewers: z.union([
		z.literal(80),
		z.literal(125),
		z.literal(200),
		z.literal(300),
		z.literal(500),
		z.literal(800)
	]),
	maxBitrateInKbps: z.union([z.literal(3000), z.literal(6000), z.literal(8000)])
});

export const getPreset = (tier: Tier) => {
	if (
		tier.maxConcurrentStreams === 1 &&
		tier.maxConcurrentViewers === 80 &&
		tier.maxBitrateInKbps == 3000
	) {
		return 'Party Starter';
	} else if (
		tier.maxConcurrentStreams === 3 &&
		tier.maxConcurrentViewers === 300 &&
		tier.maxBitrateInKbps == 6000
	) {
		return 'Tier2';
	} else if (
		tier.maxConcurrentStreams === 6 &&
		tier.maxConcurrentViewers === 800 &&
		tier.maxBitrateInKbps == 8000
	) {
		return 'Tier3';
	}
};

export const getPricing = (
	tier: Tier
): {
	streamsCost: number;
	viewersCost: number;
	bitrateCost: number;
	discountedTotal: number | undefined;
	total: number;
	finalTotal: number;
} => {
	const preset = getPreset(tier);

	let streamsCost = 0;
	if (tier.maxConcurrentStreams === 1) {
		streamsCost = 1;
	} else if (tier.maxConcurrentStreams === 2) {
		streamsCost = 2;
	} else if (tier.maxConcurrentStreams === 3) {
		streamsCost = 3;
	} else if (tier.maxConcurrentStreams === 6) {
		streamsCost = 6.2;
	}

	let viewersCost = 0;
	if (tier.maxConcurrentViewers === 80) {
		viewersCost = 2;
	} else if (tier.maxConcurrentViewers === 125) {
		viewersCost = 2.3;
	} else if (tier.maxConcurrentViewers === 200) {
		viewersCost = 2.6;
	} else if (tier.maxConcurrentViewers === 300) {
		viewersCost = 4.1;
	} else if (tier.maxConcurrentViewers === 500) {
		viewersCost = 6.0;
	} else if (tier.maxConcurrentViewers === 800) {
		viewersCost = 9.0;
	}

	let bitrateCost = 0;
	if (tier.maxBitrateInKbps === 3000) {
		bitrateCost = 2;
	} else if (tier.maxBitrateInKbps === 6000) {
		bitrateCost = 4;
	} else if (tier.maxBitrateInKbps === 8000) {
		bitrateCost = 7;
	}

	const total = bitrateCost + streamsCost + viewersCost;

	const discountedTotal =
		preset === undefined || preset === 'Party Starter' ? undefined : total * 0.9;
	return {
		streamsCost,
		viewersCost,
		bitrateCost,
		discountedTotal,
		total,
		finalTotal: discountedTotal ?? total
	};
};

export const tierFromIndexs = (
	maxViewersIndex: number,
	maxStreamsIndex: number,
	maxBitrateIndex: number
): Tier => {
	return {
		maxBitrateInKbps:
			maxBitrateIndex === 0
				? 3000
				: maxBitrateIndex === 1
					? 6000
					: maxBitrateIndex === 2
						? 8000
						: (NaN as 3000 | 6000 | 8000),
		maxConcurrentStreams:
			maxStreamsIndex === 0
				? 1
				: maxStreamsIndex === 1
					? 2
					: maxStreamsIndex === 2
						? 3
						: maxStreamsIndex === 3
							? 6
							: (NaN as 1 | 2 | 3 | 6),
		maxConcurrentViewers:
			maxViewersIndex === 0
				? 80
				: maxViewersIndex === 1
					? 125
					: maxViewersIndex === 2
						? 200
						: maxViewersIndex === 3
							? 300
							: maxViewersIndex === 4
								? 500
								: maxViewersIndex === 5
									? 800
									: (NaN as 80 | 125 | 200 | 300 | 500 | 800)
	};
};

export const tierToQueryParameters = (tier: Tier) => {
	return `maxConcurrentViewers=${tier.maxConcurrentViewers}&maxConcurrentStreams=${tier.maxConcurrentStreams}&maxBitrateInKbps=${tier.maxBitrateInKbps}`;
};

export const formatter = new Intl.NumberFormat('en-US', {
	style: 'currency',
	currency: 'USD'
});
