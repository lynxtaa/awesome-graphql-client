/**
 * @jest-environment node
 */

import { readFileSync } from 'node:fs'

import { GraphQLUpload, type FileUpload } from 'graphql-upload-minimal'

import { AwesomeGraphQLClient } from '../src/index'
import { gql } from '../src/util/gql'

import { createServer, type TestServer } from './jest/gqlServer'
import { streamToString } from './streamToString'

let server: TestServer

afterEach(async () => {
	await server?.destroy()
})

describe('fetch', () => {
	it('regular request', async () => {
		server = await createServer(
			`
				type Query {
					hello(name: String!): String!
				}
			`,
			{
				Query: {
					hello: (_, { name }: { name: string }) => `Hello, ${name}!`,
				},
			},
		)

		const client = new AwesomeGraphQLClient<string, RequestInit, Response>({
			endpoint: server.endpoint,
		})

		const query = gql`
			query Hello($name: String!) {
				hello(name: $name)
			}
		`

		const data = await client.request(query, { name: 'User' })

		expect(data).toEqual({ hello: 'Hello, User!' })
	})
})

it('streams a file using openAsBlob', async () => {
	const { openAsBlob } = await import('node:fs')

	interface UploadFile {
		uploadFile: boolean
	}
	interface UploadFileVariables {
		file: any
	}

	server = await createServer(
		`
				scalar Upload
				type Mutation {
					uploadFile(file: Upload!): Boolean
				}
				type Query {
					hello: String!
				}
			`,
		{
			Upload: GraphQLUpload as any,
			Mutation: {
				async uploadFile(_, { file }: { file: Promise<FileUpload> }) {
					// eslint-disable-next-line @typescript-eslint/unbound-method
					const { filename, createReadStream } = await file
					expect(filename).toBe('data.txt')
					const str = await streamToString(createReadStream())
					expect(str).toBe(readFileSync('./test/fixtures/data.txt', 'utf8'))

					return true
				},
			},
		},
	)

	const client = new AwesomeGraphQLClient({
		endpoint: server.endpoint,
	})

	const query = gql`
		mutation UploadFile($file: Upload!) {
			uploadFile(file: $file)
		}
	`

	const blob = await openAsBlob('./test/fixtures/data.txt')
	const file = new File([blob], 'data.txt')

	const data = await client.request<UploadFile, UploadFileVariables>(query, {
		file,
	})

	expect(data).toEqual({ uploadFile: true })
})
