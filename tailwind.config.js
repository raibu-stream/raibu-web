import defaultTheme from 'tailwindcss/defaultTheme';

export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		extend: {
			fontFamily: {
				sans: ['"Cascadia Code"', ...defaultTheme.fontFamily.sans]
			},
			screens: {
				'section-width': '800px'
			},
			spacing: {
				18: '4.5rem',
				'section-width': '800px'
			},
			backgroundImage: {
				'raibu-pattern': "url('$lib/img/raibu-pattern.svg')"
			}
		},
		colors: {
			neutral: {
				100: '#fcf8f9',
				200: '#ffffff80',
				300: '#ffffff1a',
				800: '#16080d',
				900: '#080102'
			},
			primary: {
				200: '#f495b5',
				400: '#af4b6c'
			},
			secondary: {
				800: '#2d151d',
				700: '#3e1f28'
			}
		}
	},
	plugins: []
};
