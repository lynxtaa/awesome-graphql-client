import { TypedDocumentNode } from '@graphql-typed-document-node/core'
import { extractFiles } from 'extract-files'

import { GraphQLRequestError } from './GraphQLRequestError'
import { assert } from './util/assert'
import { formatGetRequestUrl } from './util/formatGetRequestUrl'
import { isFileUpload, FileUpload } from './util/isFileUpload'
import { isResponseJSON } from './util/isResponseJSON'
import { normalizeHeaders } from './util/normalizeHeaders'
import { FetchOptions, RequestResult } from './util/types'

export class AwesomeGraphQLClient<
	TQuery = string,
	TFetchOptions extends FetchOptions = RequestInit,
	TRequestResult extends RequestResult = Response,
> {
	private endpoint: string
	private fetch: (url: string, options?: TFetchOptions) => Promise<TRequestResult>
	private fetchOptions?: TFetchOptions
	private formatQuery?: (query: TQuery) => string
	private FormData: any
	private onError?: (error: GraphQLRequestError | Error) => void
	private isFileUpload: (value: unknown) => boolean

	constructor(config: {
		/** GraphQL endpoint */
		endpoint: string
		/** Fetch polyfill if necessary */
		fetch?: (url: string, options?: any) => Promise<TRequestResult>
		/** FormData polyfill if necessary */
		FormData?: any
		/** Overrides for fetch options */
		fetchOptions?: TFetchOptions
		/** Custom query formatter */
		formatQuery?: (query: TQuery) => string
		/** Callback will be called on error  */
		onError?: (error: GraphQLRequestError | Error) => void
		/** Custom predicate function for checking if value is a file */
		isFileUpload?: (value: unknown) => boolean
	}) {
		assert(config.endpoint !== undefined, 'endpoint is required')

		assert(
			config.fetch !== undefined || typeof fetch !== 'undefined',
			'Fetch must be polyfilled or passed in new AwesomeGraphQLClient({ fetch })',
		)

		assert(
			!config.formatQuery || typeof config.formatQuery === 'function',
			'Invalid config value: `formatQuery` must be a function',
		)

		assert(
			!config.onError || typeof config.onError === 'function',
			'Invalid config value: `onError` must be a function',
		)

		assert(
			!config.isFileUpload || typeof config.isFileUpload === 'function',
			'Invalid config value: `isFileUpload` should be a function',
		)

		this.endpoint = config.endpoint
		this.fetch = config.fetch || (fetch.bind(null) as any)
		this.fetchOptions = config.fetchOptions

		this.FormData =
			config.FormData !== undefined
				? config.FormData
				: typeof FormData !== 'undefined'
				? FormData
				: undefined

		this.formatQuery = config.formatQuery
		this.onError = config.onError
		this.isFileUpload = config.isFileUpload || isFileUpload
	}

	private createRequestBody(
		query: string,
		variables?: Record<string, unknown>,
	): string | FormData {
		const { clone, files } = extractFiles(
			{ query, variables },
			'',
			this.isFileUpload as (value: unknown) => value is FileUpload,
		)
		const operationJSON = JSON.stringify(clone)

		if (files.size === 0) {
			return operationJSON
		}

		assert(
			this.FormData !== undefined,
			'FormData must be polyfilled or passed in new AwesomeGraphQLClient({ FormData })',
		)

		const form = new this.FormData()

		form.append('operations', operationJSON)

		const map: Record<string, string[]> = {}
		let i = 0
		for (const paths of files.values()) {
			map[++i] = paths
		}
		form.append('map', JSON.stringify(map))

		i = 0
		for (const file of files.keys()) {
			form.append(`${++i}`, file)
		}

		// eslint-disable-next-line @typescript-eslint/no-unsafe-return
		return form
	}

	/**
	 * Sets a new GraphQL endpoint
	 *
	 * @param endpoint new overrides for endpoint
	 */
	setEndpoint(endpoint: string): void {
		assert(endpoint !== undefined, 'endpoint is required')
		this.endpoint = endpoint
	}

	/**
	 * Returns current GraphQL endpoint
	 */
	getEndpoint(): string {
		return this.endpoint
	}

	/**
	 * Sets new overrides for fetch options
	 *
	 * @param fetchOptions new overrides for fetch options
	 */
	setFetchOptions(fetchOptions: TFetchOptions): void {
		this.fetchOptions = fetchOptions
	}

	/**
	 * Returns current overrides for fetch options
	 */
	getFetchOptions(): TFetchOptions | undefined {
		return this.fetchOptions
	}

	/**
	 * Sends GraphQL Request and returns object with 'ok: true', 'data' and 'response' fields
	 * or with 'ok: false' and 'error' fields.
	 * Notice: this function never throws
	 *
	 * @example
	 * const result = await requestSafe(...)
	 * if (!result.ok) {
	 *   throw result.error
	 * }
	 * console.log(result.data)
	 *
	 * @param query query
	 * @param variables variables
	 * @param fetchOptions overrides for fetch options
	 */
	async requestSafe<
		// Should be "any" and not "unknown" to be compatible with interfaces
		// https://github.com/microsoft/TypeScript/issues/15300#issuecomment-702872440
		TData extends Record<string, any>,
		TVariables extends Record<string, any> = Record<string, never>,
	>(
		query: TQuery extends TypedDocumentNode
			? TypedDocumentNode<TData, TVariables>
			: TQuery,
		variables?: TVariables,
		fetchOptions?: TFetchOptions,
	): Promise<
		| { ok: true; data: TData; response: TRequestResult }
		| { ok: false; error: GraphQLRequestError<TRequestResult> | Error }
	> {
		try {
			const queryAsString = this.formatQuery ? this.formatQuery(query as TQuery) : query

			assert(
				typeof queryAsString === 'string',
				`Query should be a string, not ${typeof queryAsString}. Otherwise provide formatQuery option`,
			)

			const options = {
				method: 'POST',
				...this.fetchOptions,
				...fetchOptions,
				headers: {
					// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
					...normalizeHeaders(this.fetchOptions?.headers),
					// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
					...normalizeHeaders(fetchOptions?.headers),
				},
			} as TFetchOptions

			let response: TRequestResult | Response

			if (options.method?.toUpperCase() === 'GET') {
				const url = formatGetRequestUrl({
					endpoint: this.endpoint,
					query: queryAsString,
					variables,
				})
				response = await this.fetch(url, options)
			} else {
				const body = this.createRequestBody(queryAsString, variables)

				response = await this.fetch(this.endpoint, {
					...options,
					body,
					headers:
						typeof body === 'string'
							? { ...options.headers, 'Content-Type': 'application/json' }
							: options.headers,
				})
			}

			if (!response.ok) {
				if (isResponseJSON(response)) {
					const { errors } = await response.json()

					if (errors?.[0]?.message !== undefined) {
						throw new GraphQLRequestError({
							query: queryAsString,
							variables,
							response,
							message: errors[0].message,
							extensions: errors[0].extensions,
						})
					}
				}

				throw new GraphQLRequestError({
					query: queryAsString,
					variables,
					response,
					message: `Http Status ${response.status}`,
				})
			}

			const { data, errors } = await response.json()

			if (errors?.[0] !== undefined) {
				throw new GraphQLRequestError({
					query: queryAsString,
					variables,
					response,
					message: errors[0].message,
					extensions: errors[0].extensions,
				})
			}

			return { ok: true, data, response }
		} catch (err) {
			const error = err instanceof Error ? err : new Error(String(err))

			if (this.onError) {
				try {
					this.onError(error)
				} catch {
					return { ok: false, error }
				}
			}

			return { ok: false, error }
		}
	}

	/**
	 * Makes GraphQL request and returns data or throws an error
	 *
	 * @example
	 * const data = await request(...)
	 *
	 * @param query query
	 * @param variables variables
	 * @param fetchOptions overrides for fetch options
	 */
	async request<
		TData extends Record<string, any>,
		TVariables extends Record<string, any> = Record<string, never>,
	>(
		query: TQuery extends TypedDocumentNode
			? TypedDocumentNode<TData, TVariables>
			: TQuery,
		variables?: TVariables,
		fetchOptions?: TFetchOptions,
	): Promise<TData> {
		const result = await this.requestSafe<TData, TVariables>(
			query,
			variables,
			fetchOptions,
		)

		if (!result.ok) {
			throw result.error
		}

		return result.data
	}
}
