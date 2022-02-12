/**
 * Returns URL for GraphQL GET Requests:
 * https://graphql.org/learn/serving-over-http/#get-request
 */
export function formatGetRequestUrl({
	endpoint,
	query,
	variables,
}: {
	endpoint: string
	query: string
	variables?: Record<string, unknown>
}): string {
	const searchParams = new URLSearchParams()
	searchParams.set('query', query)

	if (variables && Object.keys(variables).length > 0) {
		searchParams.set('variables', JSON.stringify(variables))
	}

	return `${endpoint}?${searchParams.toString()}`
}
