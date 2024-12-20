import { type GraphQLFieldError, type RequestResult } from './util/types'

export class GraphQLRequestError<
	TResponse extends RequestResult = Response,
> extends Error {
	query: string
	variables?: Record<string, unknown>
	response!: TResponse
	extensions?: Record<string, unknown>
	fieldErrors?: GraphQLFieldError[]

	constructor({
		query,
		variables,
		response,
		message,
		extensions,
		fieldErrors,
	}: {
		query: string
		variables?: Record<string, unknown>
		response: TResponse
		message: string
		extensions?: Record<string, unknown>
		fieldErrors?: GraphQLFieldError[]
	}) {
		super(`GraphQL Request Error: ${message}`)
		this.query = query

		if (variables) {
			this.variables = variables
		}
		if (extensions) {
			this.extensions = extensions
		}
		if (fieldErrors) {
			this.fieldErrors = fieldErrors
		}
		// Hide Response from `console.log(error)`
		Object.defineProperty(this, 'response', {
			enumerable: false,
			value: response,
		})
	}
}
