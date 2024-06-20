import { type CodegenConfig } from '@graphql-codegen/cli'

const config: CodegenConfig = {
	overwrite: true,
	schema: 'https://rickandmortyapi.com/graphql',
	documents: '{hooks,lib,pages}/**/*.{ts,tsx,graphql}',
	generates: {
		'lib/graphql-queries.ts': {
			plugins: ['typescript', 'typescript-operations', 'typescript-react-query'],
			config: {
				errorType: 'Error',
				skipTypename: true,
				exposeQueryKeys: true,
				reactQueryVersion: 5,
				avoidOptionals: {
					field: true,
					inputValue: false,
					object: false,
					defaultValue: false,
				},
				fetcher: {
					func: './gqlFetcher#gqlFetcher',
					isReactHook: false,
				},
			},
		},
	},
}

export default config
