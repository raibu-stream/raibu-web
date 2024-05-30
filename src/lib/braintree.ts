import { dev } from '$app/environment';
import { RAIBU_BRAINTREE_MERCHANT_ID, RAIBU_BRAINTREE_PRIVATE_KEY, RAIBU_BRAINTREE_PUBLIC_KEY } from '$env/static/private';
import braintree from 'braintree';

export const BraintreeGateway = new braintree.BraintreeGateway({
    environment: dev ? braintree.Environment.Sandbox : braintree.Environment.Production,
    merchantId: RAIBU_BRAINTREE_MERCHANT_ID,
    publicKey: RAIBU_BRAINTREE_PUBLIC_KEY,
    privateKey: RAIBU_BRAINTREE_PRIVATE_KEY,
});