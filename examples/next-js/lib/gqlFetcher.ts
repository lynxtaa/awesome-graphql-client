import { graphQLClient } from './graphQLClient'

export const gqlFetcher =
	<TData extends Record<string, any>, TVariables extends Record<string, any>>(
		query: string,
		variables?: TVariables,
	): (() => Promise<TData>) =>
	() =>
		graphQLClient.request<TData, TVariables>(query, variables)
