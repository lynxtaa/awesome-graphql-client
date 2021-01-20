import { GraphQLRequestError } from 'awesome-graphql-client'
import { useQuery, UseQueryOptions, QueryObserverResult } from 'react-query'

import graphQLClient from '../lib/graphQLClient'

export function useGraphQLQuery<
	TData extends Record<string, any>,
	TVariables extends Record<string, any> = Record<string, any>
>(
	query: string,
	variables?: TVariables,
	options?: UseQueryOptions<TData, GraphQLRequestError | Error>,
): QueryObserverResult<TData, GraphQLRequestError | Error> {
	return useQuery<TData, GraphQLRequestError | Error>(
		[query, variables],
		() => graphQLClient.request<TData, TVariables>(query, variables),
		options,
	)
}
