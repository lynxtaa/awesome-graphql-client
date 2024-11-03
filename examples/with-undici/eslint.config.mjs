import eslintConfig from '@lynxtaa/eslint-config'
import requiresTypechecking from '@lynxtaa/eslint-config/requires-typechecking'

// TODO: add jest
export default [
	...eslintConfig,
	...requiresTypechecking,
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
]
