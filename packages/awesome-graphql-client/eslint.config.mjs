import eslintConfig from '@lynxtaa/eslint-config'
import requiresTypechecking from '@lynxtaa/eslint-config/requires-typechecking'
import vitest from '@vitest/eslint-plugin'

export default [
	...eslintConfig,
	...requiresTypechecking,
	vitest.configs.recommended,
	{
		rules: {
			// false positive on `expect.any()` asymmetric matchers (collides with chai `.any` chain)
			'vitest/valid-expect': 'off',
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
]
