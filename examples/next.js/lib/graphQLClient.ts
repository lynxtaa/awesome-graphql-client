import { AwesomeGraphQLClient } from 'awesome-graphql-client'
import { DocumentNode } from 'graphql/language/ast'
import { print } from 'graphql/language/printer'

export default new AwesomeGraphQLClient({
	endpoint: 'https://rickandmortyapi.com/graphql',
	formatQuery: (query: DocumentNode) => print(query),
})
