/**
 * @jest-environment node
 */

import { createReadStream, statSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { Readable } from 'node:stream'
import { ReadableStream } from 'node:stream/web'

import { FileUpload, GraphQLUpload } from 'graphql-upload'
import { File } from 'undici'

import { AwesomeGraphQLClient, isFileUpload } from '../src/index'
import { gql } from '../src/util/gql'

import { createServer, TestServer } from './jest/gqlServer'
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
			isFileUpload: value => value instanceof File,
		})

		const query = gql`
			mutation UploadFile($file: Upload!) {
				uploadFile(file: $file)
			}
		`

		const data = await client.request<UploadFile, UploadFileVariables>(query, {
			file: new File(['test'], 'text.txt'),
		})

		expect(data).toEqual({ uploadFile: true })
	})

	it('stream file upload', async () => {
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

		class StreamableFile extends File {
			#filePath: string

			constructor(filePath: string) {
				const { mtime, size } = statSync(filePath)

				super([], path.parse(filePath).base, {
					lastModified: mtime.getTime(),
				})

				this.#filePath = filePath

				Object.defineProperty(this, 'size', {
					value: size,
					writable: false,
				})
			}

			stream(): ReadableStream<any> {
				// eslint-disable-next-line @typescript-eslint/no-unsafe-return
				return Readable.toWeb(createReadStream(this.#filePath))
			}
		}

		const client = new AwesomeGraphQLClient({
			endpoint: server.endpoint,
			isFileUpload: value => isFileUpload(value) || value instanceof File,
		})

		const query = gql`
			mutation UploadFile($file: Upload!) {
				uploadFile(file: $file)
			}
		`

		const data = await client.request<UploadFile, UploadFileVariables>(query, {
			file: new StreamableFile('./test/fixtures/data.txt'),
		})

		expect(data).toEqual({ uploadFile: true })
	})
})
