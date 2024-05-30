import type { Tier } from '$lib/tier';
import type { Country } from '@shopify/address';
import { writable, type Writable } from 'svelte/store';
import { address } from '$lib/utils';
import type { z } from 'zod';

export const showLoginModal = writable(false);
export const checkoutState = writable<BuildYourTierState | BillingState | PaymentState>({ stage: "BuildYourTier", maxConcurrentUsersValue: writable([0]), maxConcurrentStreamsValue: writable([0]), maxBitrateValue: writable("3000 Kbps") });

export type BuildYourTierState = {
    stage: "BuildYourTier",
    maxConcurrentUsersValue: Writable<[number]>,
    maxConcurrentStreamsValue: Writable<[number]>,
    maxBitrateValue: Writable<string>,
}

export type BillingState = {
    stage: "Billing",
    address: Writable<{
        country: Writable<{ value: Country, label: string }>,
        firstName: string,
        lastName: string,
        city: string,
        postalCode: string,
        zone: Writable<{ value: string }>,
        address1: string,
        address2: string,
    }>,
    tier: Tier
}

export type PaymentState = {
    stage: "Payment",
    tier: Tier
    address: z.infer<ReturnType<typeof address>>
}