import { AwesomeGraphQLClient } from 'awesome-graphql-client'
import { DocumentNode } from 'graphql/language/ast'
import { print } from 'graphql/language/printer'

export default new AwesomeGraphQLClient({
	endpoint: 'https://countries-274616.ew.r.appspot.com',
	formatQuery: (query: DocumentNode) => print(query),
})
