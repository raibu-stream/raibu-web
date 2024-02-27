import AddressFormatter from '@shopify/address';
import type { PageLoad } from './$types';

export const load: PageLoad = async () => {
    const addressFormatter = new AddressFormatter('en');

    return {
        countries: await addressFormatter.getCountries()
    };
};