import { graphQLClient } from './graphQLClient'
import { TypedDocumentString } from './graphql-queries'

export const gqlFetcher =
	<TData extends Record<string, any>, TVariables extends Record<string, any>>(
		query: TypedDocumentString<unknown, unknown>,
		variables?: TVariables,
	): (() => Promise<TData>) =>
	async () =>
		graphQLClient.request<TData, TVariables>(query, variables)
