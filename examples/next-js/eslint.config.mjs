import eslintReact from '@eslint-react/eslint-plugin'
import eslintConfig from '@lynxtaa/eslint-config'
import requiresTypechecking from '@lynxtaa/eslint-config/requires-typechecking'
import nextPlugin from '@next/eslint-plugin-next'
import vitest from '@vitest/eslint-plugin'
import hooksPlugin from 'eslint-plugin-react-hooks'

export default [
	...eslintConfig,
	...requiresTypechecking,
	vitest.configs.recommended,
	{
		files: ['**/*.ts', '**/*.tsx'],
		plugins: {
			'@eslint-react': eslintReact,
		},
		rules: {
			...eslintReact.configs.recommended.rules,
		},
	},
	{
		languageOptions: {
			parserOptions: {
				projectService: {
					allowDefaultProject: ['*.js', '*.mjs'],
				},
				tsconfigRootDir: import.meta.dirname,
			},
		},
	},
	{
		plugins: {
			'react-hooks': hooksPlugin,
		},
		rules: hooksPlugin.configs.recommended.rules,
	},
	{
		plugins: {
			'@next/next': nextPlugin,
		},
		rules: {
			...nextPlugin.configs.recommended.rules,
			...nextPlugin.configs['core-web-vitals'].rules,
		},
	},
	{
		rules: {
			'unicorn/name-replacements': 'off',
		},
	},
	{
		ignores: ['.next', 'coverage', 'lib/graphql-queries.ts'],
	},
]
