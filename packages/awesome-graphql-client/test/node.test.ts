/**
 * @jest-environment node
 */

import { createReadStream, statSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { Readable } from 'node:stream'

import { type FileUpload, GraphQLUpload } from 'graphql-upload'

import { AwesomeGraphQLClient } from '../src/index'
import { gql } from '../src/util/gql'

import { createServer, type TestServer } from './jest/gqlServer'
import { streamToString } from './streamToString'

const maybeDescribe = (condition: boolean) => (condition ? describe : describe.skip)

const nodeMajorVersion = Number(process.versions.node.split('.')[0])

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

maybeDescribe(nodeMajorVersion < 20)('node < 20', () => {
	it('streams a file', async () => {
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

		// https://github.com/nodejs/undici/issues/2202#issuecomment-1664134203
		class StreamableFile extends Blob {
			#filePath: string
			name: string
			lastModified: number
			override type: string

			constructor(filePath: string) {
				const { mtime, size } = statSync(filePath)

				super([])

				this.name = path.parse(filePath).base
				this.lastModified = mtime.getTime()
				this.#filePath = filePath
				this.type = ''

				Object.defineProperty(this, 'size', {
					value: size,
					writable: false,
				})
				Object.defineProperty(this, Symbol.toStringTag, {
					value: 'File',
					writable: false,
				})
			}

			override stream(): ReadableStream<any> {
				return Readable.toWeb(createReadStream(this.#filePath)) as ReadableStream
			}
		}

		const client = new AwesomeGraphQLClient({
			endpoint: server.endpoint,
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

maybeDescribe(nodeMajorVersion >= 20)('node >= 20', () => {
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
		const file = new File([blob as BlobPart], 'data.txt')

		const data = await client.request<UploadFile, UploadFileVariables>(query, {
			file,
		})

		expect(data).toEqual({ uploadFile: true })
	})
})
