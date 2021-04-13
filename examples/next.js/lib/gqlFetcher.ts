import { graphQLClient } from './graphQLClient'

export const gqlFetcher = <TData, TVariables>(
	query: string,
	variables?: TVariables,
): (() => Promise<TData>) => () =>
	graphQLClient.request<TData, TVariables>(query, variables)
