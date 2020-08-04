import { GraphQLRequestError } from 'awesome-graphql-client'
import dequal from 'dequal'
import { DocumentNode } from 'graphql/language/ast'
import useSWR, { ConfigInterface, responseInterface } from 'swr'

import graphQLClient from '../lib/graphQLClient'

export default function useQuery<TData extends {}, TVariables extends {} = {}>(
	query: DocumentNode,
	variables?: TVariables,
	config?: ConfigInterface<TData, GraphQLRequestError | Error>,
): responseInterface<TData, GraphQLRequestError | Error> {
	const jsonVariables = JSON.stringify(variables)

	const result = useSWR(
		[query, jsonVariables],
		(query, jsonVariables) =>
			graphQLClient.request<TData, TVariables>(query, JSON.parse(jsonVariables)),
		config,
	)

	return result
}
