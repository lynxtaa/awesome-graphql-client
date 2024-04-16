/**
 * @jest-environment node
 */

import FormData from 'form-data'
import { FileUpload, GraphQLUpload } from 'graphql-upload'
import nodeFetch from 'node-fetch'
import {
	fetch as undiciFetch,
	FormData as UndiciFormData,
	File as UndiciFile,
	RequestInit as UndiciRequestInit,
	Response as UndiciResponse,
} from 'undici'

import { AwesomeGraphQLClient } from '../src/index'
import { gql } from '../src/util/gql'

import { createServer, TestServer } from './jest/gqlServer'
import { streamToString } from './streamToString'

const maybeDescribe = (condition: boolean) => (condition ? describe : describe.skip)

let server: TestServer

afterEach(async () => {
	await server?.destroy()
})

describe('node-fetch', () => {
	it('sends GraphQL request with variables', async () => {
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

		const client = new AwesomeGraphQLClient({
			endpoint: server.endpoint,
			fetch: nodeFetch,
			FormData,
		})

		const query = gql`
			query Hello($name: String!) {
				hello(name: $name)
			}
		`

		const data = await client.request(query, { name: 'User' })

		expect(data).toEqual({ hello: 'Hello, User!' })
	})

	it('file upload', async () => {
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
						const { createReadStream } = await file
						const str = await streamToString(createReadStream())
						expect(str).toBe('test')

						return true
					},
				},
			},
		)

		const client = new AwesomeGraphQLClient({
			endpoint: server.endpoint,
			fetch: nodeFetch,
			FormData,
		})

		const query = gql`
			mutation UploadFile($file: Upload!) {
				uploadFile(file: $file)
			}
		`

		const data = await client.request<UploadFile, UploadFileVariables>(query, {
			file: Buffer.from('test', 'utf8'),
		})

		expect(data).toEqual({ uploadFile: true })
	})
})

maybeDescribe(process.version.startsWith('v16.'))('undici', () => {
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

		const client = new AwesomeGraphQLClient<string, UndiciRequestInit, UndiciResponse>({
			endpoint: server.endpoint,
			fetch: undiciFetch,
		})

		const query = gql`
			query Hello($name: String!) {
				hello(name: $name)
			}
		`

		const data = await client.request(query, { name: 'User' })

		expect(data).toEqual({ hello: 'Hello, User!' })
	})

	it('file upload', async () => {
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
						expect(filename).toBe('text.txt')
						const str = await streamToString(createReadStream())
						expect(str).toBe('test')

						return true
					},
				},
			},
		)

		const client = new AwesomeGraphQLClient({
			endpoint: server.endpoint,
			fetch: undiciFetch,
			FormData: UndiciFormData,
			isFileUpload: value => value instanceof UndiciFile,
		})

		const query = gql`
			mutation UploadFile($file: Upload!) {
				uploadFile(file: $file)
			}
		`

		const data = await client.request<UploadFile, UploadFileVariables>(query, {
			file: new UndiciFile(['test'], 'text.txt'),
		})

		expect(data).toEqual({ uploadFile: true })
	})
})
