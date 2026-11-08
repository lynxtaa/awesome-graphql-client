import { AwesomeGraphQLClient } from 'awesome-graphql-client'

import { TypedDocumentString } from './graphql-queries'

export const graphQLClient = new AwesomeGraphQLClient({
	endpoint: 'https://rickandmortyapi.com/graphql',
	formatQuery: (query: TypedDocumentString<unknown, unknown>) => query.toString(),
})
