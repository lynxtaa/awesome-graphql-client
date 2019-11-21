import { print } from 'graphql/language/printer'
import { ASTNode } from 'graphql/language/ast'
import { Response, HeadersInit, RequestInfo, RequestInit } from 'node-fetch'
import isResponseJSON from './isResponseJSON'

type GraphQLQuery = string | ASTNode

type fetchFunction = (url: RequestInfo, init?: RequestInit) => Promise<Response>

interface ClientOptions {
	endpoint: string
	fetch: fetchFunction
	headers?: HeadersInit
}

interface RawRequestResult {
	data: object | null
	errors: { message: string }[] | null
	response: Response
}

type Variables = { [key: string]: any }

export default class AwesomeGraphqlClient {
	fetch: fetchFunction
	endpoint!: string
	headers: HeadersInit

	constructor({ fetch, headers = {}, endpoint }: ClientOptions) {
		if (!endpoint) {
			throw new Error('endpoint is required')
		}

		this.fetch = fetch || window.fetch
		this.headers = { 'Content-Type': 'application/json', ...headers }
		this.endpoint = endpoint
	}

	async rawRequest(
		query: GraphQLQuery,
		variables?: Variables,
		headers: HeadersInit = {},
	): Promise<RawRequestResult> {
		const body = JSON.stringify({
			query: typeof query === 'string' ? query : print(query),
			variables: variables || undefined,
		})

		const response: Response = await this.fetch(this.endpoint, {
			method: 'POST',
			body,
			headers: { ...this.headers, ...headers },
		})

		const { data, errors } = isResponseJSON(response)
			? await response.json()
			: { data: null, errors: null }

		return { response, data, errors }
	}

	async request(
		query: GraphQLQuery,
		variables?: Variables,
		headers: HeadersInit = {},
	): Promise<object> {
		const { data, errors, response } = await this.rawRequest(query, variables, headers)

		if (!response.ok) {
			throw new Error(`Response ${response.status}: ${response.statusText}`)
		}

		if (errors && errors.length > 0) {
			throw new Error(`Error: ${errors[0].message}`)
		}

		return data!
	}
}
