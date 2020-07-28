import { GraphQLRequestError } from 'awesome-graphql-client'
import dequal from 'dequal'
import { DocumentNode } from 'graphql/language/ast'
import { useRef, useMemo } from 'react'
import useSWR, { ConfigInterface, responseInterface } from 'swr'

import graphQLClient from '../lib/graphQLClient'

export default function useQuery<TData extends {}, TVariables extends {} = {}>(
	query: DocumentNode,
	variables?: TVariables,
	config?: ConfigInterface<TData, GraphQLRequestError | Error>,
): responseInterface<TData, GraphQLRequestError | Error> {
	const prevVariables = useRef(variables)

	const memoizedVariables = useMemo(() => {
		if (!dequal(variables, prevVariables.current)) {
			prevVariables.current = variables
			return variables
		}

		return prevVariables.current
	}, [variables])

	const result = useSWR(
		[query, memoizedVariables],
		(query, variables) => graphQLClient.request<TData, TVariables>(query, variables),
		config,
	)

	return result
}
