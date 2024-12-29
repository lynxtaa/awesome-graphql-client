import eslintConfig from '@lynxtaa/eslint-config'
import requiresTypechecking from '@lynxtaa/eslint-config/requires-typechecking'
import nextPlugin from '@next/eslint-plugin-next'
import jest from 'eslint-plugin-jest'
import reactPlugin from 'eslint-plugin-react'
import hooksPlugin from 'eslint-plugin-react-hooks'

export default [
	...eslintConfig,
	...requiresTypechecking,
	jest.configs['flat/recommended'],
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
		...reactPlugin.configs.flat.recommended,
		rules: {
			...reactPlugin.configs.flat.recommended.rules,
			'react/react-in-jsx-scope': 'off',
		},
		settings: {
			react: {
				version: 'detect',
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
		ignores: ['.next', 'coverage', 'lib/graphql-queries.ts'],
	},
]
