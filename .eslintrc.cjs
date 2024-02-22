/** @type { import("eslint").Linter.FlatConfig } */
module.exports = {
	root: true,
	extends: [
		'eslint:recommended',
		'plugin:svelte/recommended',
		'prettier',
		'plugin:@typescript-eslint/recommended'
	],
	parser: '@typescript-eslint/parser',
	plugins: ['@typescript-eslint', 'prettier'],
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
		'@typescript-eslint/no-floating-promises': 'error'
	}
};
