<script lang="ts">
	import { goto } from '$app/navigation';
	import FormError from '$lib/components/FormError.svelte';
	import tailwindConfig from '$lib/tailwindConfig';
	import { formatter, getPricing, type Tier } from '$lib/tier';
	import { handleApiResponse, address as zAddress } from '$lib/utils';
	import braintree, { type HostedFields } from 'braintree-web';
	import type { FlowType } from 'paypal-checkout-components';
	import { onMount } from 'svelte';
	import { toast } from 'svelte-sonner';
	import { quintOut } from 'svelte/easing';
	import { fade, slide } from 'svelte/transition';
	import { z } from 'zod';

	export let tier: Tier;
	export let address: z.infer<ReturnType<typeof zAddress>>;
	export let email: string;
	export let signupDate: Date;
	export let ip: string;

	const ONE_DAY_IN_MILLISECONDS = 24 * 60 * 60 * 1000;

	const subscribe = async (nonce: string): Promise<string | undefined> => {
		return await handleApiResponse(
			await fetch('./subscribe', {
				method: 'post',
				body: JSON.stringify({ tier, paymentMethodNonce: nonce, address })
			})
		);
	};

	const clearErrors = () => {
		hostedFieldsError = undefined;
		hostedFieldsCvvError = undefined;
		hostedFieldsExprError = undefined;
		hostedFieldsNameError = undefined;
		hostedFieldsNumberError = undefined;
		buttonsError = undefined;
	};

	const onSubmitCard = async () => {
		if (hostedFieldsRequest !== undefined) {
			return;
		}

		clearErrors();

		if (hostedFields !== 'Failed' && hostedFields !== 'Loading' && threeDSecure !== undefined) {
			const state = hostedFields.getState();
			if (state.fields.cardholderName.isEmpty) {
				hostedFieldsNameError = 'This is required';
			} else if (!state.fields.cardholderName.isValid) {
				hostedFieldsNameError = 'Must be valid';
			}
			if (state.fields.cvv.isEmpty) {
				hostedFieldsCvvError = 'This is required';
			} else if (!state.fields.cvv.isValid) {
				hostedFieldsCvvError = 'Must be valid';
			}
			if (state.fields.number.isEmpty) {
				hostedFieldsNumberError = 'This is required';
			} else if (!state.fields.number.isValid) {
				hostedFieldsNumberError = 'Must be valid';
			}
			if (state.fields.expirationDate.isEmpty) {
				hostedFieldsExprError = 'This is required';
			} else if (!state.fields.expirationDate.isValid) {
				hostedFieldsExprError = 'Must be valid';
			}
			if (
				hostedFieldsNameError !== undefined ||
				hostedFieldsCvvError !== undefined ||
				hostedFieldsNumberError !== undefined ||
				hostedFieldsExprError !== undefined
			) {
				return;
			}

			let res;
			try {
				res = await hostedFields.tokenize();
			} catch (err: any) {
				if (err.message !== undefined) {
					hostedFieldsError = err.message;
				} else {
					hostedFieldsError = 'An unknown error occurred. You have not been charged.';
				}

				return;
			}

			const pricing = getPricing(tier);
			let ageIndicator;
			const daysSinceSignup = Math.round(
				Math.abs((signupDate.getTime() - Date.now()) / ONE_DAY_IN_MILLISECONDS)
			);
			if (daysSinceSignup < 30) {
				ageIndicator = '03';
			} else if (daysSinceSignup < 60) {
				ageIndicator = '04';
			} else {
				ageIndicator = '05';
			}

			hostedFieldsRequest = (await threeDSecure)
				.verifyCard({
					nonce: res.nonce,
					amount: (pricing.discountedTotal ?? pricing.total).toFixed(2),
					bin: res.details.bin,
					email: email,
					collectDeviceData: true,
					billingAddress: {
						streetAddress: address.address1,
						extendedAddress: address.address2,
						locality: address.city,
						region: address.zone,
						postalCode: address.postalCode,
						countryCodeAlpha2: address.country
					},
					additionalInformation: {
						productCode: 'DIG',
						accountAgeIndicator: ageIndicator,
						accountCreateDate: `${signupDate.getFullYear().toString().padStart(4, '0')}${signupDate.getMonth().toString().padStart(2, '0')}${signupDate.getDate().toString().padStart(2, '0')}`,
						ipAddress: ip,
						orderDescription: 'Media streaming subscription service',
						userAgent: window.navigator.userAgent,
						authenticationIndicator: '02',
						recurringFrequency: '28'
					},
					onLookupComplete: (_: any, next: any) => {
						next();
					}
				} as any)
				.then((threeDRes) => subscribe(threeDRes.nonce))
				.then(async (maybeErr) => {
					hostedFieldsError = maybeErr;
					hostedFieldsRequest = undefined;

					if (maybeErr === undefined) {
						await goto(`/user`, { invalidateAll: true });
						toast.success(
							"Payment successful! You should have access to you tier now. If you don't, contact support."
						);
					}
				});
		}
	};

	let threeDSecure: undefined | Promise<braintree.ThreeDSecure>;
	let hostedFields: 'Loading' | HostedFields | 'Failed' = 'Loading';
	let hostedFieldsError: string | undefined;
	let hostedFieldsNumberError: string | undefined;
	let hostedFieldsExprError: string | undefined;
	let hostedFieldsCvvError: string | undefined;
	let hostedFieldsNameError: string | undefined;
	let hostedFieldsRequest: Promise<unknown> | undefined;
	let hostedFieldsCardType: string | undefined;
	let hostedFieldsCvvName: string = 'Security code';

	let buttonsReadiness: 'Loading' | 'Ready' | 'Failed' = 'Loading';
	let buttonsError: string | undefined;
	onMount(async () => {
		const clientToken = await fetch('./subscribe/create-client-token', {
			method: 'post'
		}).then((res) => res.json());
		const braintreeClient = await braintree.client.create({
			authorization: clientToken
		});

		threeDSecure = braintree.threeDSecure.create({
			client: braintreeClient,
			version: 2
		});

		await Promise.all([
			braintree.hostedFields
				.create({
					client: braintreeClient,
					styles: {
						input: {
							'font-size': '0.875rem',
							'line-height': '1.25rem',
							'font-family': tailwindConfig.fontFamily.sans.join(', '),
							color: tailwindConfig.colors.neutral[100],
							padding: tailwindConfig.spacing[3],
							appearance: 'none'
						}
					},
					fields: {
						number: {
							selector: '#card-number-field-container',
							placeholder: ''
						},
						cvv: {
							selector: '#card-cvv-field-container',
							placeholder: '',
							maskInput: true
						},
						expirationDate: {
							selector: '#card-expiry-field-container',
							placeholder: ''
						},
						cardholderName: {
							selector: '#card-name-field-container',
							placeholder: ''
						}
					}
				})
				.then((hostedFieldsRes) => {
					hostedFieldsRes.on('inputSubmitRequest', async () => {
						await onSubmitCard();
					});

					hostedFieldsRes.on('notEmpty', (event) => {
						if (event.emittedBy === 'cardholderName') {
							hostedFieldsNameError = undefined;
						} else if (event.emittedBy === 'cvv') {
							hostedFieldsCvvError = undefined;
						} else if (event.emittedBy === 'number') {
							hostedFieldsNumberError = undefined;
						} else if (event.emittedBy === 'expirationDate') {
							hostedFieldsExprError = undefined;
						}
					});

					hostedFieldsRes.on('validityChange', (event) => {
						if (event.emittedBy === 'cardholderName' && event.fields.cardholderName.isValid) {
							hostedFieldsNameError = undefined;
						} else if (event.emittedBy === 'cvv' && event.fields.cvv.isValid) {
							hostedFieldsCvvError = undefined;
						} else if (event.emittedBy === 'number' && event.fields.number.isValid) {
							hostedFieldsNumberError = undefined;
						} else if (
							event.emittedBy === 'expirationDate' &&
							event.fields.expirationDate.isValid
						) {
							hostedFieldsExprError = undefined;
						}
					});

					hostedFieldsRes.on('cardTypeChange', (event) => {
						console.log(event.cards);

						if (event.cards.length === 1) {
							hostedFieldsCardType = event.cards[0].type;
							hostedFieldsCvvName = event.cards[0].code.name;
						} else {
							hostedFieldsCardType = undefined;
							hostedFieldsCvvName = 'Security code';
						}
					});

					hostedFields = hostedFieldsRes;
				})
				.catch(() => {
					hostedFields = 'Failed';
				}),
			braintree.paypalCheckout
				.create({
					client: braintreeClient
				})
				.then(async (paypalCheckoutInstance) => {
					await paypalCheckoutInstance.loadPayPalSDK({
						vault: true,
						locale: 'en_US'
					});

					const pricing = getPricing(tier);
					paypal
						.Buttons({
							fundingSource: paypal.FUNDING.PAYPAL as any,
							createBillingAgreement: () => {
								clearErrors();

								return paypalCheckoutInstance.createPayment({
									flow: 'vault' as FlowType,
									billingAgreementDescription: `Subscription for ${formatter.format(pricing.discountedTotal ?? pricing.total)} monthly`
								});
							},
							onApprove: async (data) => {
								const res = await paypalCheckoutInstance.tokenizePayment(data);

								buttonsError = await subscribe(res.nonce);
								if (buttonsError === undefined) {
									goto(`/user`, { invalidateAll: true }).then(() =>
										toast.success(
											"Payment successful! You should have access to you tier now. If you don't, contact support."
										)
									);
								}

								return res;
							}
						})
						.render('#paypal-button-container');

					buttonsReadiness = 'Ready';
				})
				.catch((err) => {
					buttonsReadiness = 'Failed';
				})
		]);
	});
</script>

<div class="col-start-1 row-start-1" transition:fade={{ duration: 700, easing: quintOut }}>
	<h3>Payment</h3>

	{#if hostedFields !== 'Failed'}
		<div class="relative mb-12 w-full max-w-lg" out:slide={{ duration: 700, easing: quintOut }}>
			{#if hostedFields === 'Loading'}
				<div class="absolute inset-0 bg-neutral-800" out:fade={{ duration: 350, easing: quintOut }}>
					<div class="animate-pulse text-left">
						<div class="ghost h-4 w-36"></div>
						<div class="ghost mb-6 mt-2 h-11"></div>
						<div class="mb-6 flex gap-4">
							<div class="grow">
								<div class="ghost h-4 w-28"></div>
								<div class="ghost mt-2 h-11"></div>
							</div>
							<div class="grow">
								<div class="ghost h-4 w-24"></div>
								<div class="ghost mt-2 h-11"></div>
							</div>
						</div>
						<div class="ghost h-4 w-52"></div>
						<div class="ghost mb-6 mt-2 h-11"></div>
					</div>
				</div>
			{/if}

			<form on:submit|preventDefault={onSubmitCard} class="text-left">
				<label for="card-number-field-container">Card number</label>
				<div class="mb-6 mt-2">
					<div class="mb-2 flex items-center gap-4 rounded-sm bg-secondary-700 pr-4">
						<div id="card-number-field-container" class="h-11 grow"></div>
						<div class="w-4 text-xl" aria-hidden="true">
							{#if hostedFieldsCardType === 'visa'}
								<i class="fa-brands fa-cc-visa"></i>
							{:else if hostedFieldsCardType === 'master-card'}
								<i class="fa-brands fa-cc-mastercard"></i>
							{:else if hostedFieldsCardType === 'american-express'}
								<i class="fa-brands fa-cc-amex"></i>
							{:else if hostedFieldsCardType === 'diners-club'}
								<i class="fa-brands fa-cc-diners-club"></i>
							{:else if hostedFieldsCardType === 'discover'}
								<i class="fa-brands fa-cc-discover"></i>
							{:else if hostedFieldsCardType === 'jcb'}
								<i class="fa-brands fa-cc-jcb"></i>
							{/if}
						</div>
					</div>
					{#if hostedFieldsNumberError !== undefined}
						<FormError>{hostedFieldsNumberError}</FormError>
					{/if}
				</div>
				<div class="mb-6 flex gap-4">
					<div>
						<label for="card-expiry-field-container">Card expiration (MM/YY)</label>
						<div
							id="card-expiry-field-container"
							class="mb-2 mt-2 h-11 rounded-sm bg-secondary-700"
						></div>
						{#if hostedFieldsExprError !== undefined}
							<FormError>{hostedFieldsExprError}</FormError>
						{/if}
					</div>
					<div>
						<label for="card-cvv-field-container">{hostedFieldsCvvName}</label>
						<div
							id="card-cvv-field-container"
							class="mb-2 mt-2 h-11 rounded-sm bg-secondary-700"
						></div>
						{#if hostedFieldsCvvError !== undefined}
							<FormError>{hostedFieldsCvvError}</FormError>
						{/if}
					</div>
				</div>
				<label for="card-name-field-container">Name on card</label>
				<div class="mb-7 mt-2">
					<div id="card-name-field-container" class="mb-2 h-11 rounded-sm bg-secondary-700" />
					{#if hostedFieldsNameError !== undefined}
						<FormError>{hostedFieldsNameError}</FormError>
					{/if}
				</div>

				<button class="button mb-4 h-11 w-full text-lg">
					{#await hostedFieldsRequest}
						<i class="fa-solid fa-circle-notch animate-spin" aria-hidden="true"></i>
						<span class="sr-only">Loading</span>
						<!-- eslint-disable-next-line @typescript-eslint/no-unused-vars -->
					{:then _}
						Confirm
					{/await}
				</button>
				{#if hostedFieldsError !== undefined}
					<FormError>{hostedFieldsError}</FormError>
				{/if}
			</form>
		</div>
	{/if}

	{#if buttonsReadiness !== 'Failed'}
		<div class="relative max-w-lg text-left" out:slide={{ duration: 700, easing: quintOut }}>
			{#if hostedFields === 'Loading'}
				<div
					class="absolute inset-0 z-10 bg-neutral-800"
					out:fade={{ duration: 350, easing: quintOut }}
				>
					<div class="animate-pulse text-left">
						<div class="ghost mb-4 h-14 rounded"></div>
						<div class="ghost mb-4 h-14 rounded"></div>
					</div>
				</div>
			{/if}
			<div id="paypal-button-container" class="mb-2"></div>
			{#if buttonsError !== undefined}
				<FormError>{buttonsError}</FormError>
			{/if}
		</div>
	{/if}
</div>

<style>
	:global(.braintree-hosted-fields-focused) {
		@apply outline outline-1 outline-neutral-100;
	}
</style>
