/**
 * Fake `graphql-tag`.
 * Recommended if you're using `graphql-tag` only for syntax highlighting
 * and static analysis such as linting and types generation.
 * It has less computational cost and makes overall smaller bundles. See:
 * https://github.com/lynxtaa/awesome-graphql-client#approach-2-use-fake-graphql-tag
 */
export const gql = (strings: TemplateStringsArray, ...values: any[]): string =>
	strings
		.reduce((prev, curr, i) => prev + curr + (i in values ? values[i] : ''), '')
		.trim()
