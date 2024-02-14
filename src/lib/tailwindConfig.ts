import resolveConfig from 'tailwindcss/resolveConfig';
import tailwindConfigRaw from './../../tailwind.config';

const tailwindConfig = resolveConfig(tailwindConfigRaw).theme;

export default tailwindConfig;
