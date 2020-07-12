interface GraphQLRequestErrorOptions {
	query: string
	variables?: Record<string, unknown>
	response?: Response
	message: string
}

export default class GraphQLRequestError extends Error {
	query: string
	variables?: Record<string, unknown>
	response?: Response

	constructor({ query, variables, response, message }: GraphQLRequestErrorOptions) {
		super(`GraphQL Request Error: ${message}`)

		this.query = query
		this.variables = variables
		this.response = response
	}
}
