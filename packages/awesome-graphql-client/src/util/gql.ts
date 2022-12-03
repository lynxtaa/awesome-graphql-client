/**
 * Fake `graphql-tag`.
 * Recommended if you're using `graphql-tag` only for syntax highlighting
 * and static analysis such as linting and types generation.
 * It has less computational cost and makes overall smaller bundles. See:
 * https://github.com/lynxtaa/awesome-graphql-client#approach-2-use-fake-graphql-tag
 */
export const gql = (strings: TemplateStringsArray, ...values: unknown[]): string => {
	let result = ''

	for (const [index, string] of strings.entries()) {
		// eslint-disable-next-line @typescript-eslint/restrict-template-expressions
		result += `${string}${index in values ? values[index] : ''}`
	}

	return result.trim()
}
