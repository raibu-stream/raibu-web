import tailwindConfigRaw from './../../tailwind.config';
import resolveConfig from 'tailwindcss/resolveConfig.js';

export default async () => {
	return { data: resolveConfig(tailwindConfigRaw).theme };
};
