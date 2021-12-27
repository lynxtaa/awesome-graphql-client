/**
 * @jest-environment node
 */

import { createReadStream } from 'fs'
import http from 'http'
import { join } from 'path'

import FormData from 'form-data'
import { FileUpload, GraphQLUpload } from 'graphql-upload'
import fetch, { RequestInit, Response } from 'node-fetch'

import { AwesomeGraphQLClient } from '../src/index'
import { gql } from '../src/util/gql'

import { createServer, TestServer } from './jest/gqlServer'
import { streamToString } from './streamToString'

let server: TestServer

afterEach(async () => {
	await server?.destroy()
})

it('throws if no Fetch polyfill provided', () => {
	expect(() => new AwesomeGraphQLClient({ endpoint: '/' })).toThrow(
		/Fetch must be polyfilled/,
	)
})

it('throws on file upload mutation if no FormData polyfill provided', async () => {
	interface UploadFile {
		uploadFile: boolean
	}
	interface UploadFileVariables {
		file: any
	}

	const client = new AwesomeGraphQLClient<string, RequestInit, Response>({
		endpoint: 'http://localhost:1234/api/graphql',
		fetch,
		fetchOptions: {
			agent: new http.Agent({ keepAlive: true }),
		},
	})

	const query = gql`
		mutation UploadFile($file: Upload!) {
			uploadFile(file: $file)
		}
	`

	await expect(
		client.request<UploadFile, UploadFileVariables>(query, {
			file: createReadStream(join(__filename)),
		}),
	).rejects.toThrow(/FormData must be polyfilled/)
})

it('uses provided polyfills', async () => {
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
		fetch,
		FormData,
	})

	const query = gql`
		mutation UploadFile($file: Upload!) {
			uploadFile(file: $file)
		}
	`

	const data = await client.request<UploadFile, UploadFileVariables>(query, {
		file: Buffer.from('test', 'utf-8'),
	})

	expect(data).toEqual({ uploadFile: true })
})
