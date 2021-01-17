import { GraphQLRequestError } from 'awesome-graphql-client'
import { useQuery, UseQueryOptions, QueryObserverResult } from 'react-query'

import graphQLClient from '../lib/graphQLClient'

// eslint-disable-next-line @typescript-eslint/ban-types
export function useGraphQLQuery<TData extends {}, TVariables extends {} = {}>(
	query: string,
	variables?: TVariables,
	options?: UseQueryOptions<TData, GraphQLRequestError>,
): QueryObserverResult<TData, GraphQLRequestError> {
	return useQuery<TData, GraphQLRequestError>(
		[query, variables],
		() => graphQLClient.request<TData, TVariables>(query, variables),
		options,
	)
}
