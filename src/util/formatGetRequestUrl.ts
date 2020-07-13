/**
 * Returns URL for GraphQL Get Requests:
 * https://graphql.org/learn/serving-over-http/#get-request
 */
export default function formatGetRequestUrl({
	endpoint,
	query,
	variables,
}: {
	endpoint: string
	query: string
	variables?: Record<string, unknown>
}): string {
	const url = new URL(endpoint)

	url.searchParams.append('query', query)

	if (variables) {
		url.searchParams.append('variables', JSON.stringify(variables))
	}

	return url.toString()
}
