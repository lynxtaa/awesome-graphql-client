/* eslint-disable no-console */
import { TypedDocumentNode } from '@graphql-typed-document-node/core'
import { AwesomeGraphQLClient } from 'awesome-graphql-client'
import { print } from 'graphql/language/printer'

import { GetCharactersDocument } from './gql-documents'

const gqlClient = new AwesomeGraphQLClient({
	endpoint: 'https://rickandmortyapi.com/graphql',
	formatQuery: (query: TypedDocumentNode) => print(query),
})

async function main() {
	// Client is infering types from provided document
	// so typechecking works automagically
	const data = await gqlClient.request(GetCharactersDocument, { name: 'Rick' })
	console.log(data.characters?.results?.map(result => result?.name))
}

main().catch(err => console.error(err))
