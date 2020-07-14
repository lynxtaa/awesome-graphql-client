/**
 * Returns URL for GraphQL GET Requests:
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

	if (variables && Object.keys(variables).length > 0) {
		url.searchParams.append('variables', JSON.stringify(variables))
	}

	return url.toString()
}
