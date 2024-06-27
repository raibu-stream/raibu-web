<script lang="ts">
	import FormError from '$lib/components/FormError.svelte';
	import tailwindConfig from '$lib/tailwindConfig';
	import { assert } from '$lib/utils';
	import { createAccordion, melt } from '@melt-ui/svelte';
	import { onMount } from 'svelte';
	import { quintOut } from 'svelte/easing';
	import { fade, slide } from 'svelte/transition';
	import {
		loadStripe,
		type Stripe,
		type StripeCardCvcElement,
		type StripeCardExpiryElement,
		type StripeCardNumberElement
	} from '@stripe/stripe-js';
	import paypalIcon from '$lib/img/paypal.svg';
	import { PUBLIC_RAIBU_STRIPE_PUBLIC_KEY } from '$env/static/public';
	import type { Action } from 'svelte/action';
	import bancontact from '$lib/img/bancontact.svg';
	import { goto } from '$app/navigation';
	import Select from './Select.svelte';
	import SelectOption from './SelectOption.svelte';
	import cascadiaCode from '$lib/fonts/CascadiaCode.woff2';

	export let clientSecret: string | (() => Promise<{ clientSecret: string } | { error: string }>);
	export let beforeNavigate: undefined | (() => void) = undefined;
	export let returnUrl: string;
	export let type: 'payment' | 'setup';
	export let failed = false;

	const clearErrors = () => {
		hostedFieldsError = undefined;
		hostedFieldsCvcError = undefined;
		hostedFieldsExprError = undefined;
		hostedFieldsNameError = undefined;
		hostedFieldsNumberError = undefined;
		paypalError = undefined;
		idealBankError = undefined;
		idealError = undefined;
		idealNameError = undefined;
		idealEmailError = undefined;
		bancontactError = undefined;
		bancontactEmailError = undefined;
		bancontactNameError = undefined;
	};

	const isOngoingRequest = () => {
		return (
			hostedFieldsRequestOngoing ||
			paypalRequestOngoing ||
			idealRequestOngoing ||
			bancontactRequestOngoing
		);
	};

	const onSubmitCard = async () => {
		if (isOngoingRequest()) {
			return;
		}

		hostedFieldsRequestOngoing = true;
		(async () => {
			clearErrors();

			if (hostedFields === 'Ready') {
				assert(
					hostedFieldsElements !== undefined,
					'hostedFieldsElements was undefined when hostedFieldsReadiness was Ready'
				);

				if (hostedFieldsName === '') {
					hostedFieldsNameError = 'This is required';
					return;
				}

				let finalClientSecret;
				if (typeof clientSecret === 'string') {
					finalClientSecret = clientSecret;
				} else {
					const res = await clientSecret();
					if ('error' in res) {
						hostedFieldsError = res.error;
						return;
					}
					finalClientSecret = res.clientSecret;
				}

				let res;
				if (type === 'payment') {
					res = await hostedFieldsElements.stripe.confirmCardPayment(finalClientSecret, {
						payment_method: {
							card: hostedFieldsElements.cardNumber,
							billing_details: {
								name: hostedFieldsName
							}
						}
					});
				} else {
					res = await hostedFieldsElements.stripe.confirmCardSetup(finalClientSecret, {
						payment_method: {
							card: hostedFieldsElements.cardNumber,
							billing_details: {
								name: hostedFieldsName
							}
						}
					});
				}

				if (res.error === undefined) {
					if (beforeNavigate !== undefined) beforeNavigate();
					await goto(returnUrl, {
						invalidateAll: true
					});
					return;
				}

				if (res.error.message === undefined) {
					hostedFieldsError = 'An unknown error occurred';
					return;
				}

				if (res.error.code === 'incomplete_number' || res.error.code === 'invalid_number') {
					hostedFieldsNumberError = res.error.message;
					return;
				}

				if (res.error.code === 'incomplete_cvc' || res.error.code === 'invalid_cvc') {
					hostedFieldsCvcError = res.error.message;
					return;
				}

				if (
					res.error.code === 'incomplete_expiry' ||
					res.error.code === 'invalid_expiry' ||
					res.error.code === 'invalid_expiry_year_past' ||
					res.error.code === 'invalid_expiry_month_past'
				) {
					hostedFieldsExprError = res.error.message;
					return;
				}

				hostedFieldsError = res.error.message;
			}
		})().finally(() => {
			hostedFieldsRequestOngoing = false;
		});
	};

	const mountStripeElement: Action<
		HTMLElement,
		{
			mount: (domElement: HTMLElement) => void;
			unmount: () => void;
		}
	> = (node, element) => {
		element.mount(node);

		return {
			destroy() {
				element.unmount();
			}
		};
	};

	const onSubmitIdeal = async () => {
		if (isOngoingRequest()) {
			return;
		}

		idealRequestOngoing = true;
		(async () => {
			clearErrors();

			if ($idealBank === undefined) {
				idealBankError = 'This is required';
				return;
			}

			if (idealName === '') {
				idealNameError = 'This is required';
				return;
			}

			if (idealEmail === '') {
				idealEmailError = 'This is required';
				return;
			}

			const stripe = (await loadStripe(PUBLIC_RAIBU_STRIPE_PUBLIC_KEY))!;

			let finalClientSecret;
			if (typeof clientSecret === 'string') {
				finalClientSecret = clientSecret;
			} else {
				const res = await clientSecret();
				if ('error' in res) {
					idealError = res.error;
					return;
				}
				finalClientSecret = res.clientSecret;
			}

			let res;
			if (type === 'payment') {
				res = await stripe.confirmIdealPayment(finalClientSecret, {
					payment_method: {
						billing_details: {
							name: idealName,
							email: idealEmail
						},
						ideal: {
							bank: $idealBank.value
						}
					},
					return_url: returnUrl
				});
			} else {
				res = await stripe.confirmIdealSetup(finalClientSecret, {
					payment_method: {
						billing_details: {
							name: idealName,
							email: idealEmail
						},
						ideal: {
							bank: $idealBank
						}
					},
					return_url: returnUrl
				});
			}

			if (res.error !== undefined) {
				idealError = res.error.message ?? 'An unknown error occurred';
			} else {
				if (beforeNavigate !== undefined) beforeNavigate();
				await goto(returnUrl, {
					invalidateAll: true
				});
			}
		})().finally(() => {
			idealRequestOngoing = false;
		});
	};

	const onSubmitBancontact = async () => {
		if (isOngoingRequest()) {
			return;
		}

		bancontactRequestOngoing = true;
		(async () => {
			clearErrors();

			if (bancontactName === '') {
				bancontactNameError = 'This is required';
				return;
			}

			if (bancontactEmail === '') {
				bancontactEmailError = 'This is required';
				return;
			}

			const stripe = (await loadStripe(PUBLIC_RAIBU_STRIPE_PUBLIC_KEY))!;

			let finalClientSecret;
			if (typeof clientSecret === 'string') {
				finalClientSecret = clientSecret;
			} else {
				const res = await clientSecret();
				if ('error' in res) {
					bancontactError = res.error;
					return;
				}
				finalClientSecret = res.clientSecret;
			}

			let res;
			if (type === 'payment') {
				res = await stripe.confirmBancontactPayment(finalClientSecret, {
					return_url: returnUrl,
					payment_method: {
						billing_details: {
							name: bancontactName,
							email: bancontactEmail
						}
					}
				});
			} else {
				res = await stripe.confirmBancontactSetup(finalClientSecret, {
					return_url: returnUrl,
					payment_method: {
						billing_details: {
							name: bancontactName,
							email: bancontactEmail
						}
					}
				});
			}

			if (res.error !== undefined) {
				bancontactError = res.error.message ?? 'An unknown error occurred';
			} else {
				if (beforeNavigate !== undefined) beforeNavigate();
				await goto(returnUrl, {
					invalidateAll: true
				});
			}
		})().finally(() => {
			bancontactRequestOngoing = false;
		});
	};

	const onSubmitPaypal = () => {
		if (isOngoingRequest()) {
			return;
		}

		paypalRequestOngoing = true;
		(async () => {
			clearErrors();

			const stripe = (await loadStripe(PUBLIC_RAIBU_STRIPE_PUBLIC_KEY))!;

			let finalClientSecret;
			if (typeof clientSecret === 'string') {
				finalClientSecret = clientSecret;
			} else {
				const res = await clientSecret();
				if ('error' in res) {
					bancontactError = res.error;
					return;
				}
				finalClientSecret = res.clientSecret;
			}

			let res;
			if (type === 'payment') {
				res = await stripe.confirmPayPalPayment(finalClientSecret, {
					return_url: returnUrl
				});
			} else {
				res = await stripe.confirmPayPalSetup(finalClientSecret, {
					return_url: returnUrl
				});
			}

			if (res.error !== undefined) {
				paypalError = res.error.message ?? 'An unknown error occurred';
			} else {
				if (beforeNavigate !== undefined) beforeNavigate();
				await goto(returnUrl, {
					invalidateAll: true
				});
			}
		})().finally(() => {
			paypalRequestOngoing = false;
		});
	};

	let failedPaymentMessage =
		'There was an error processing your payment information. You were not charged. Try again.';

	let hostedFields:
		| { numberReady: boolean; cvcReady: boolean; expiryReady: boolean }
		| 'Ready'
		| 'Failed' = { numberReady: false, cvcReady: false, expiryReady: false };
	let hostedFieldsError: string | undefined = failed ? failedPaymentMessage : undefined;
	let hostedFieldsNumberError: string | undefined;
	let hostedFieldsExprError: string | undefined;
	let hostedFieldsCvcError: string | undefined;
	let hostedFieldsNameError: string | undefined;
	let hostedFieldsName = '';
	let hostedFieldsRequestOngoing = false;
	let hostedFieldsCardType: string | undefined;
	let hostedFieldsCvvName: string = 'Security code';
	let hostedFieldsElements:
		| undefined
		| {
				stripe: Stripe;
				cardNumber: StripeCardNumberElement;
				cardCvc: StripeCardCvcElement;
				cardExpiry: StripeCardExpiryElement;
		  };

	let paypalError: string | undefined = failed ? failedPaymentMessage : undefined;
	let paypalRequestOngoing = false;

	let idealError: string | undefined = failed ? failedPaymentMessage : undefined;
	let idealNameError: string | undefined;
	let idealBankError: string | undefined;
	let idealEmailError: string | undefined;
	let idealBank: any;
	let idealName = '';
	let idealEmail = '';
	let idealRequestOngoing = false;

	let bancontactError: string | undefined = failed ? failedPaymentMessage : undefined;
	let bancontactNameError: string | undefined;
	let bancontactEmailError: string | undefined;
	let bancontactName = '';
	let bancontactEmail = '';
	let bancontactRequestOngoing = false;

	onMount(async () => {
		const stripe = (await loadStripe(PUBLIC_RAIBU_STRIPE_PUBLIC_KEY))!;

		isSelected.subscribe(async (isSelected) => {
			if (isSelected('card')) {
				hostedFields = { numberReady: false, cvcReady: false, expiryReady: false };

				const style = {
					base: {
						fontSize: `${Number(tailwindConfig.fontSize.sm[0].replaceAll('rem', '')) * parseFloat(getComputedStyle(document.documentElement).fontSize)}px`,
						fontFamily: tailwindConfig.fontFamily.sans.join(', '),
						color: tailwindConfig.colors.neutral[100]
					},
					invalid: {
						color: tailwindConfig.colors.neutral[100]
					}
				};

				if (hostedFieldsElements === undefined) {
					const elements = stripe.elements({
						locale: 'en',
						fonts: [
							{
								family: 'Cascadia Code',
								src: `url(${cascadiaCode})`
							}
						]
					});

					hostedFieldsElements = {
						stripe,
						cardNumber: elements.create('cardNumber', {
							placeholder: '',
							style
						}),
						cardCvc: elements.create('cardCvc', {
							placeholder: '',
							style
						}),
						cardExpiry: elements.create('cardExpiry', {
							placeholder: '',
							style
						})
					};

					hostedFieldsElements.cardNumber.on('loaderror', () => {
						hostedFields = 'Failed';
					});

					hostedFieldsElements.cardNumber.on('change', (event) => {
						if (event.brand === 'unknown') {
							hostedFieldsCardType = undefined;
						} else {
							hostedFieldsCardType = event.brand;
						}
					});

					hostedFieldsElements.cardNumber.on('change', (event) => {
						if (event.complete) {
							hostedFieldsNumberError = undefined;
						}
					});
					hostedFieldsElements.cardCvc.on('change', (event) => {
						if (event.complete) {
							hostedFieldsCvcError = undefined;
						}
					});
					hostedFieldsElements.cardExpiry.on('change', (event) => {
						if (event.complete) {
							hostedFieldsExprError = undefined;
						}
					});

					const checkIfReady = () => {
						if (
							hostedFields !== 'Ready' &&
							hostedFields !== 'Failed' &&
							hostedFields.cvcReady &&
							hostedFields.numberReady &&
							hostedFields.expiryReady
						) {
							hostedFields = 'Ready';
						}
					};

					hostedFieldsElements.cardNumber.on('ready', () => {
						if (hostedFields !== 'Ready' && hostedFields !== 'Failed') {
							hostedFields.numberReady = true;
							checkIfReady();
						}
					});
					hostedFieldsElements.cardCvc.on('ready', () => {
						if (hostedFields !== 'Ready' && hostedFields !== 'Failed') {
							hostedFields.cvcReady = true;
							checkIfReady();
						}
					});
					hostedFieldsElements.cardExpiry.on('ready', () => {
						if (hostedFields !== 'Ready' && hostedFields !== 'Failed') {
							hostedFields.expiryReady = true;
							checkIfReady();
						}
					});
				}
			}
		});
	});

	const {
		elements: { content, item, trigger, root },
		helpers: { isSelected }
	} = createAccordion({
		defaultValue: 'card'
	});
</script>

<div class="w-full">
	<div {...$root} class="mb-6 w-full overflow-hidden rounded-lg">
		<div use:melt={$item('card')} class="w-full">
			<h2 class="w-full">
				<button
					class="flex w-full items-center justify-between border-b border-neutral-300 bg-secondary-700 p-4 text-left text-base"
					use:melt={$trigger('card')}
				>
					<div class="flex items-center gap-4">
						<div
							class="flex size-5 items-center justify-center rounded-full border-2 border-neutral-300"
							class:border-none={$isSelected('card')}
							class:bg-primary-200={$isSelected('card')}
						>
							{#if $isSelected('card')}
								<div class="size-2 rounded-full bg-secondary-800" />
							{/if}
						</div>
						Card
					</div>
					<div>
						<i class="fa-solid fa-credit-card text-xl" aria-hidden="true"></i>
						<span class="sr-only">credit card</span>
					</div>
				</button>
			</h2>
			{#if $isSelected('card')}
				<div
					use:melt={$content}
					transition:slide={{ duration: 700, easing: quintOut }}
					class="max-h-96 overflow-auto border-b border-neutral-300 bg-secondary-700/35 p-4"
				>
					{#if hostedFields !== 'Failed'}
						<div class="relative w-full max-w-lg" out:slide={{ duration: 700, easing: quintOut }}>
							{#if hostedFields !== 'Ready'}
								<div class="absolute inset-0" out:fade={{ duration: 350, easing: quintOut }}>
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

							{#if hostedFieldsElements}
								<form
									on:submit|preventDefault={onSubmitCard}
									class="text-left"
									class:invisible={hostedFields !== 'Ready'}
								>
									<label for="card-number-field-container">Card number</label>
									<div class="mb-6 mt-2">
										<div
											class="input-container mb-2 flex grow items-center gap-4 rounded-sm bg-secondary-700 pr-6 outline-1 outline-neutral-100 has-[.StripeElement--focus]:outline"
										>
											<div
												id="card-number-field-container"
												use:mountStripeElement={hostedFieldsElements.cardNumber}
												class="h-11 grow p-3.5"
											></div>
											<div class="w-4 text-xl" aria-hidden="true">
												{#if hostedFieldsCardType === 'visa'}
													<i
														class="fa-brands fa-cc-visa"
														transition:fade={{ easing: quintOut, duration: 250 }}
													></i>
												{:else if hostedFieldsCardType === 'mastercard'}
													<i
														class="fa-brands fa-cc-mastercard"
														transition:fade={{ easing: quintOut, duration: 250 }}
													></i>
												{:else if hostedFieldsCardType === 'amex'}
													<i
														class="fa-brands fa-cc-amex"
														transition:fade={{ easing: quintOut, duration: 250 }}
													></i>
												{:else if hostedFieldsCardType === 'diners'}
													<i
														class="fa-brands fa-cc-diners-club"
														transition:fade={{ easing: quintOut, duration: 250 }}
													></i>
												{:else if hostedFieldsCardType === 'discover'}
													<i
														class="fa-brands fa-cc-discover"
														transition:fade={{ easing: quintOut, duration: 250 }}
													></i>
												{:else if hostedFieldsCardType === 'jcb'}
													<i
														class="fa-brands fa-cc-jcb"
														transition:fade={{ easing: quintOut, duration: 250 }}
													></i>
												{/if}
											</div>
										</div>
										{#if hostedFieldsNumberError !== undefined}
											<FormError>{hostedFieldsNumberError}</FormError>
										{/if}
									</div>
									<div class="mb-6 flex flex-col gap-4 sm:flex-row">
										<div class="grow basis-0">
											<label for="card-expiry-field-container">Card expiration (MM/YY)</label>
											<div
												id="card-expiry-field-container"
												class="mb-2 mt-2 h-11 rounded-sm bg-secondary-700 p-3.5 sm:mb-0"
												use:mountStripeElement={hostedFieldsElements.cardExpiry}
											></div>
											{#if hostedFieldsExprError !== undefined}
												<FormError>{hostedFieldsExprError}</FormError>
											{/if}
										</div>
										<div class="grow basis-0">
											<label for="card-cvv-field-container">{hostedFieldsCvvName}</label>
											<div
												id="card-cvv-field-container"
												class="mt-2 h-11 rounded-sm bg-secondary-700 p-3.5"
												use:mountStripeElement={hostedFieldsElements.cardCvc}
											></div>
											{#if hostedFieldsCvcError !== undefined}
												<FormError>{hostedFieldsCvcError}</FormError>
											{/if}
										</div>
									</div>
									<label for="card-name-field-container">Name on card</label>
									<div class="mb-2 mt-2 w-full">
										<input
											id="card-name-field-container"
											class="input mb-2 w-full max-w-none"
											autocomplete="billing name"
											bind:value={hostedFieldsName}
										/>
										{#if hostedFieldsNameError !== undefined}
											<FormError>{hostedFieldsNameError}</FormError>
										{/if}
									</div>
								</form>
							{/if}
						</div>
					{/if}
				</div>
			{/if}
		</div>

		<div use:melt={$item('paypal')}>
			<h2 class="w-full">
				<button
					class="flex w-full items-center justify-between border-b border-neutral-300 bg-secondary-700 p-4 text-left text-base"
					use:melt={$trigger('paypal')}
				>
					<div class="flex items-center gap-4">
						<div
							class="flex size-5 items-center justify-center rounded-full border-2 border-neutral-300"
							class:border-none={$isSelected('paypal')}
							class:bg-primary-200={$isSelected('paypal')}
						>
							{#if $isSelected('paypal')}
								<div class="size-2 rounded-full bg-secondary-800" />
							{/if}
						</div>
						Paypal
					</div>
					<div>
						<i class="fa-solid fa-cc-paypal text-2xl" aria-hidden="true"></i>
						<span class="sr-only">paypal account</span>
					</div>
				</button>
			</h2>
		</div>

		<div use:melt={$item('ideal')}>
			<h2 class="w-full">
				<button
					class="flex w-full items-center justify-between border-b border-neutral-300 bg-secondary-700 p-4 text-left text-base"
					use:melt={$trigger('ideal')}
				>
					<div class="flex items-center gap-4">
						<div
							class="flex size-5 items-center justify-center rounded-full border-2 border-neutral-300"
							class:border-none={$isSelected('ideal')}
							class:bg-primary-200={$isSelected('ideal')}
						>
							{#if $isSelected('ideal')}
								<div class="size-2 rounded-full bg-secondary-800" />
							{/if}
						</div>
						iDEAL
					</div>
					<div>
						<i class="fa-brands fa-ideal text-2xl" aria-hidden="true"></i>
						<span class="sr-only">iDEAL</span>
					</div>
				</button>
			</h2>
			{#if $isSelected('ideal')}
				<div
					use:melt={$content}
					transition:slide={{ duration: 700, easing: quintOut }}
					class="max-h-96 border-b border-neutral-300 bg-secondary-700/35 p-4"
				>
					<form on:submit|preventDefault={onSubmitIdeal} class="text-left">
						<div class="mb-6">
							<Select
								inputLabel="Bank"
								placeholder="Select a bank"
								let:option
								let:isSelected
								class="w-full max-w-none"
								zIndex={50}
								bind:selectedValue={idealBank}
							>
								<SelectOption {option} {isSelected} label="ABN AMRO" value="abn_amro" />
								<SelectOption {option} {isSelected} label="ASN Bank" value="asn_bank" />
								<SelectOption {option} {isSelected} label="bunq B.V." value="bunq" />
								<SelectOption {option} {isSelected} label="Handelsbanken" value="handelsbanken" />
								<SelectOption {option} {isSelected} label="ING" value="ing" />
								<SelectOption {option} {isSelected} label="Knab" value="knab" />
								<SelectOption {option} {isSelected} label="Moneyou" value="moneyou" />
								<SelectOption {option} {isSelected} label="N26" value="n26" />
								<SelectOption {option} {isSelected} label="Nationale-Nederlanden" value="nn" />
								<SelectOption {option} {isSelected} label="Moneyou" value="moneyou" />
								<SelectOption {option} {isSelected} label="Rabobank" value="rabobank" />
								<SelectOption {option} {isSelected} label="RegioBank" value="regiobank" />
								<SelectOption {option} {isSelected} label="Revolut" value="revolut" />
								<SelectOption
									{option}
									{isSelected}
									label="SNS Bank (De Volksbank)"
									value="sns_bank"
								/>
								<SelectOption {option} {isSelected} label="Triodos Bank" value="triodos_bank" />
								<SelectOption {option} {isSelected} label="Van Lanschot" value="van_lanschot" />
								<SelectOption {option} {isSelected} label="Yoursafe" value="yoursafe" />
							</Select>
							{#if idealBankError !== undefined}
								<FormError class="mt-2">{idealBankError}</FormError>
							{/if}
						</div>
						<label for="ideal-name">Full name</label>
						<div class="mb-6 mt-2">
							<input
								id="ideal-name"
								class="input w-full max-w-none"
								autocomplete="billing name"
								bind:value={idealName}
							/>
							{#if idealNameError !== undefined}
								<FormError class="mt-2">{idealNameError}</FormError>
							{/if}
						</div>
						<label for="ideal-email">Email</label>
						<div class="mb-2 mt-2">
							<input
								id="ideal-email"
								class="input w-full max-w-none"
								autocomplete="billing email"
								bind:value={idealEmail}
							/>
							{#if idealEmailError !== undefined}
								<FormError class="mt-2">{idealEmailError}</FormError>
							{/if}
						</div>
					</form>
				</div>
			{/if}
		</div>

		<div use:melt={$item('bancontact')}>
			<h2 class="w-full">
				<button
					class="flex w-full items-center justify-between bg-secondary-700 p-4 text-left text-base"
					use:melt={$trigger('bancontact')}
				>
					<div class="flex items-center gap-4">
						<div
							class="flex size-5 items-center justify-center rounded-full border-2 border-neutral-300"
							class:border-none={$isSelected('bancontact')}
							class:bg-primary-200={$isSelected('bancontact')}
						>
							{#if $isSelected('bancontact')}
								<div class="size-2 rounded-full bg-secondary-800" />
							{/if}
						</div>
						Bancontact
					</div>
					<div>
						<img src={bancontact} alt="bancontact" class="h-6" aria-hidden="true" />
					</div>
				</button>
			</h2>
		</div>
		{#if $isSelected('bancontact')}
			<div
				use:melt={$content}
				transition:slide={{ duration: 700, easing: quintOut }}
				class="max-h-96 bg-secondary-700/35 p-4"
			>
				<form on:submit|preventDefault={onSubmitBancontact} class="text-left">
					<label for="bancontact-name">Full name</label>
					<div class="mb-6 mt-2">
						<input
							id="bancontact-name"
							class="input w-full max-w-none"
							autocomplete="billing name"
							bind:value={bancontactName}
						/>
						{#if bancontactNameError !== undefined}
							<FormError class="mt-2">{bancontactNameError}</FormError>
						{/if}
					</div>
					<label for="ideal-bancontact">Email</label>
					<div class="mb-2 mt-2">
						<input
							id="ideal-bancontact"
							class="input w-full max-w-none"
							autocomplete="billing email"
							bind:value={bancontactEmail}
						/>
						{#if bancontactEmailError !== undefined}
							<FormError class="mt-2">{bancontactEmailError}</FormError>
						{/if}
					</div>
				</form>
			</div>
		{/if}
	</div>

	{#if $isSelected('paypal')}
		<button
			class="flex h-[45px] w-full items-center justify-center rounded bg-[#ffc439] hover:brightness-95"
			on:click={onSubmitPaypal}
		>
			{#if paypalRequestOngoing}
				<i class="fa-solid fa-circle-notch animate-spin text-neutral-900" aria-hidden="true"></i>
				<span class="sr-only">Loading</span>
			{:else}
				<img src={paypalIcon} alt="PayPal" class="h-20" />
			{/if}
		</button>
		{#if paypalError !== undefined}
			<FormError class="mt-2">{paypalError}</FormError>
		{/if}
	{:else if $isSelected('ideal')}
		<button class="button h-11 w-full text-lg" on:click={onSubmitIdeal}>
			{#if idealRequestOngoing}
				<i class="fa-solid fa-circle-notch animate-spin" aria-hidden="true"></i>
				<span class="sr-only">Loading</span>
			{:else}
				Pay with iDEAL
			{/if}
		</button>
		{#if idealError !== undefined}
			<FormError class="mt-2">{idealError}</FormError>
		{/if}
	{:else if $isSelected('bancontact')}
		<button class="button h-11 w-full text-lg" on:click={onSubmitBancontact}>
			{#if bancontactRequestOngoing}
				<i class="fa-solid fa-circle-notch animate-spin" aria-hidden="true"></i>
				<span class="sr-only">Loading</span>
			{:else}
				Pay with Bancontact
			{/if}
		</button>
		{#if bancontactError !== undefined}
			<FormError class="mt-2">{bancontactError}</FormError>
		{/if}
	{:else if $isSelected('card')}
		<button class="button h-11 w-full text-lg" on:click={onSubmitCard}>
			{#if hostedFieldsRequestOngoing}
				<i class="fa-solid fa-circle-notch animate-spin" aria-hidden="true"></i>
				<span class="sr-only">Loading</span>
			{:else}
				Confirm
			{/if}
		</button>
		{#if hostedFieldsError !== undefined}
			<FormError class="mt-2">{hostedFieldsError}</FormError>
		{/if}
	{:else}
		<button class="button h-11 w-full text-lg" disabled>Confirm</button>
	{/if}

	{#if $isSelected('bancontact') || $isSelected('ideal')}
		<p class="mt-2 text-xs text-neutral-200" transition:slide={{ duration: 500, easing: quintOut }}>
			By providing your payment information and confirming this payment, you authorise (A) Raibu and
			Stripe, our payment service provider, to send instructions to your bank to debit your account
			and (B) your bank to debit your account in accordance with those instructions. As part of your
			rights, you are entitled to a refund from your bank under the terms and conditions of your
			agreement with your bank. A refund must be claimed within 8 weeks starting from the date on
			which your account was debited. Your rights are explained in a statement that you can obtain
			from your bank. You agree to receive notifications for future debits up to 2 days before they
			occur.
		</p>
	{/if}
</div>

<style>
	:global(.StripeElement--focus:not(.input-container .StripeElement--focus)) {
		@apply outline outline-1 outline-neutral-100;
	}
</style>
