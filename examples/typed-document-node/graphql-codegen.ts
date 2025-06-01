import { type CodegenConfig } from '@graphql-codegen/cli'

const config: CodegenConfig = {
	overwrite: true,
	schema: 'https://rickandmortyapi.com/graphql',
	documents: 'src/**/*.{ts,tsx,graphql}',
	generates: {
		'src/gql-documents.ts': {
			plugins: ['typescript', 'typescript-operations', 'typed-document-node'],
			config: {
				skipTypename: true,
				enumsAsTypes: true,
				avoidOptionals: {
					field: true,
					inputValue: false,
					object: false,
					defaultValue: false,
				},
			},
		},
	},
}

export default config
