import { and, eq } from 'drizzle-orm';
import { db } from './db';
import { product } from './schema';
import { getPreset, getPricing, type Tier } from '$lib/tier';
import { stripeClient } from '$lib/stripe';

export const findOrCreateProduct = async (tier: Tier) => {
	return await db.transaction(async (tx) => {
		const maybeProduct = await tx.query.product.findFirst({
			where: and(
				eq(product.maxConcurrentViewers, tier.maxConcurrentViewers),
				eq(product.maxConcurrentStreams, tier.maxConcurrentStreams),
				eq(product.maxBitrateInKbps, tier.maxBitrateInKbps)
			)
		});

		if (maybeProduct !== undefined) {
			const stripeProduct = await stripeClient.products.retrieve(maybeProduct.id);
			return stripeProduct;
		} else {
			const stripeProduct = await stripeClient.products.create({
				name: `Raibu streaming service ${getPreset(tier) === undefined ? 'custom tier' : getPreset(tier)}`,
				default_price_data: {
					unit_amount: getPricing(tier).finalTotal * 100,
					currency: 'usd',
					recurring: {
						interval: 'month'
					},
					currency_options: {
						eur: {
							unit_amount: getPricing(tier).finalTotal * 100
						}
					}
				}
			});
			await tx.insert(product).values({
				id: stripeProduct.id,
				...tier
			});

			return stripeProduct;
		}
	});
};
