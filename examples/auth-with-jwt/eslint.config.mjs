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
				// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
				tsconfigRootDir: import.meta.dirname,
			},
		},
	},
]
