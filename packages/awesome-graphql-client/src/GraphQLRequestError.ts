import { RequestResult } from './util/types'

export class GraphQLRequestError<
	TResponse extends RequestResult = Response,
> extends Error {
	query: string
	variables?: Record<string, unknown>
	response!: TResponse
	extensions?: Record<string, unknown>

	constructor({
		query,
		variables,
		response,
		message,
		extensions,
	}: {
		query: string
		variables?: Record<string, unknown>
		response: TResponse
		message: string
		extensions?: Record<string, unknown>
	}) {
		super(`GraphQL Request Error: ${message}`)
		this.query = query
		if (variables) {
			this.variables = variables
		}
		if (extensions) {
			this.extensions = extensions
		}
		// Hide Response from `console.log(error)`
		Object.defineProperty(this, 'response', {
			enumerable: false,
			value: response,
		})
	}
}
