import { RequestResult } from './util/types'

export class GraphQLRequestError<
	TResponse extends RequestResult = Response,
> extends Error {
	query: string
	variables?: Record<string, unknown>
	response: TResponse

	constructor({
		query,
		variables,
		response,
		message,
	}: {
		query: string
		variables?: Record<string, unknown>
		response: TResponse
		message: string
	}) {
		super(`GraphQL Request Error: ${message}`)

		this.query = query
		this.variables = variables
		this.response = response
	}
}
