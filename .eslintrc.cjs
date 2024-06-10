/** @type { import("eslint").Linter.FlatConfig } */
module.exports = {
	root: true,
	extends: [
		'eslint:recommended',
		'plugin:svelte/recommended',
		'prettier',
		'plugin:@typescript-eslint/recommended',
		'plugin:tailwindcss/recommended',
		'plugin:drizzle/recommended'
	],
	parser: '@typescript-eslint/parser',
	plugins: ['@typescript-eslint', 'prettier', 'drizzle'],
	parserOptions: {
		sourceType: 'module',
		ecmaVersion: 2020,
		extraFileExtensions: ['.svelte'],
		project: ['./tsconfig.json']
	},
	env: {
		browser: true,
		es2017: true,
		node: true
	},
	globals: {
		NodeJS: true
	},
	overrides: [
		{
			files: ['*.svelte'],
			parser: 'svelte-eslint-parser',
			parserOptions: {
				parser: '@typescript-eslint/parser'
			}
		},
		{
			extends: ['plugin:@typescript-eslint/disable-type-checked'],
			files: ['./*']
		},
		{
			files: '*',
			excludedFiles: ['*.ts'],
			rules: {
				'@typescript-eslint/no-floating-promises': 'off'
			}
		}
	],
	rules: {
		'@typescript-eslint/no-explicit-any': 'off',
		'svelte/no-unused-svelte-ignore': 'off',
		'@typescript-eslint/no-floating-promises': 'error',
		'tailwindcss/no-custom-classname': 'off',
		'drizzle/enforce-delete-with-where': ['error', { drizzleObjectName: ['db', 'tx'] }]
	}
};
