/* eslint-disable no-console */
import { TypedDocumentNode } from '@graphql-typed-document-node/core'
import { AwesomeGraphQLClient } from 'awesome-graphql-client'
import { print } from 'graphql/language/printer'
import fetch from 'node-fetch'

import { GetCharactersDocument } from './gql-documents'

const gqlClient = new AwesomeGraphQLClient({
	endpoint: 'https://rickandmortyapi.com/graphql',
	fetch,
	formatQuery: (query: TypedDocumentNode) => print(query),
})

async function main() {
	// Client is infering types from provided document
	// so typechecking works automagically
	const data = await gqlClient.request(GetCharactersDocument, { name: 'Rick' })
	console.log(data.characters?.results?.map(result => result?.name))
}

// eslint-disable-next-line unicorn/prefer-top-level-await
main().catch(err => console.error(err))
