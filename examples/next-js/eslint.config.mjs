import eslintConfig from '@lynxtaa/eslint-config'
import requiresTypechecking from '@lynxtaa/eslint-config/requires-typechecking'
import jest from 'eslint-plugin-jest'

// TODO: add 	...compat.extends('next/core-web-vitals'),
export default [
	...eslintConfig,
	...requiresTypechecking,
	jest.configs['flat/recommended'],
	{
		languageOptions: {
			parserOptions: {
				projectService: {
					allowDefaultProject: ['eslint.config.mjs'],
				},
				tsconfigRootDir: import.meta.dirname,
			},
		},
	},
	{
		ignores: ['lib/graphql-queries.ts'],
	},
]
