/**
 * @jest-environment jsdom
 */
import { IncomingHttpHeaders } from 'node:http'

import { TypedDocumentNode } from '@graphql-typed-document-node/core'
import { print, DocumentNode } from 'graphql'
import graphqlTag from 'graphql-tag'
import { GraphQLUpload, FileUpload } from 'graphql-upload'
import mercurius from 'mercurius'

import { AwesomeGraphQLClient, GraphQLRequestError } from '../src/index'
import { gql } from '../src/util/gql'

import { createServer, TestServer } from './jest/gqlServer'
import { streamToString } from './streamToString'

let server: TestServer

afterEach(async () => {
	await server?.destroy()
})

if (typeof fetch === 'undefined') {
	// eslint-disable-next-line global-require
	require('whatwg-fetch')
}

it('sends GraphQL request without variables', async () => {
	interface GetUsers {
		users: { id: number; login: string }[]
	}

	const users = [{ id: 10, login: 'admin' }]

	server = await createServer(
		`
			type Query {
				users: [User!]!
			}
			type User {
				id: Int!
				login: String!
			}
		`,
		{
			Query: { users: () => users },
		},
	)

	const client = new AwesomeGraphQLClient({ endpoint: server.endpoint })

	expect(client.getEndpoint()).toBe(server.endpoint)

	const query = `
		 query GetUsers {
			 users {
				 id
				 login
			 }
		 }
	 `

	const data = await client.request<GetUsers>(query)

	expect(data).toEqual({ users })
})

it('sends GraphQL request with variables', async () => {
	interface GetUser {
		user: { id: number; login: string } | null
	}

	interface GetUserVariables {
		id: number
	}

	const users = [{ id: 10, login: 'admin' }]

	server = await createServer(
		`
			type Query {
				user(id: Int!): User
			}
			type User {
				id: Int!
				login: String!
			}
		`,
		{
			Query: {
				user: (source, args) => users.find(user => user.id === args.id) ?? null,
			},
		},
	)

	const client = new AwesomeGraphQLClient({ endpoint: server.endpoint })

	const query = gql`
		query GetUser($id: Int!) {
			user(id: $id) {
				id
				login
			}
		}
	`

	const data = await client.request<GetUser, GetUserVariables>(query, { id: 10 })

	expect(data).toEqual({ user: { id: 10, login: 'admin' } })
})

it('supports custom query formatter', async () => {
	interface GetUsers {
		users: { id: number; login: string }[]
	}

	const users = [{ id: 10, login: 'admin' }]

	server = await createServer(
		`
			type Query {
				users: [User!]!
			}
			type User {
				id: Int!
				login: String!
			}
		`,
		{
			Query: {
				users: () => users,
			},
		},
	)

	const client = new AwesomeGraphQLClient({
		endpoint: server.endpoint,
		formatQuery: (query: DocumentNode) => print(query),
	})

	const query = graphqlTag`
		 query GetUsers {
			 users {
				 id
				 login
			 }
		 }
	 `

	const data = await client.request<GetUsers>(query)

	expect(data).toEqual({ users })
})

it('supports TypedDocumentNode', async () => {
	type GetUserQuery = {
		user: { id: number; login: string } | null
	}

	type GetUserQueryVariables = { id: number }

	const user = { id: 10, login: 'admin' }

	server = await createServer(
		`
			type Query {
				user(id: Int!): User
			}
			type User {
				id: Int!
				login: String!
			}
		`,
		{
			Query: {
				user: () => user,
			},
		},
	)

	const client = new AwesomeGraphQLClient({
		endpoint: server.endpoint,
		formatQuery: (query: TypedDocumentNode) => print(query),
	})

	const GetUserDocument: TypedDocumentNode<GetUserQuery, GetUserQueryVariables> =
		graphqlTag`
		 query GetUser($id: Int!) {
			 user(id: $id) {
				 id
				 login
			 }
		 }
	 `

	const data = await client.request(GetUserDocument, { id: 123 })

	expect(data).toEqual({ user })
})

it('sends GraphQL GET request without variables', async () => {
	interface GetUsers {
		users: { id: number; login: string }[]
	}

	const users = [{ id: 10, login: 'admin' }]

	server = await createServer(
		`
			type Query {
				users: [User!]!
			}
			type User {
				id: Int!
				login: String!
			}
		`,
		{
			Query: {
				users: () => users,
			},
		},
	)

	const client = new AwesomeGraphQLClient({
		endpoint: server.endpoint,
		fetchOptions: { method: 'GET' },
	})

	const query = gql`
		query GetUsers {
			users {
				id
				login
			}
		}
	`

	const data = await client.request<GetUsers>(query)

	expect(data).toEqual({ users })
})

it('sends GraphQL GET request with variables', async () => {
	interface GetUser {
		user: { id: number; login: string } | null
	}

	interface GetUserVariables {
		id: number
	}

	const users = [{ id: 10, login: 'admin' }]

	server = await createServer(
		`
			type Query {
				user(id: Int!): User
			}
			type User {
				id: Int!
				login: String!
			}
		`,
		{
			Query: {
				user: (_, args) => users.find(user => user.id === args.id) ?? null,
			},
		},
	)

	const client = new AwesomeGraphQLClient({ endpoint: server.endpoint })

	const query = gql`
		query GetUser($id: Int!) {
			user(id: $id) {
				id
				login
			}
		}
	`

	const data = await client.request<GetUser, GetUserVariables>(
		query,
		{ id: 10 },
		{ method: 'GET' },
	)

	expect(data).toEqual({ user: { id: 10, login: 'admin' } })
})

it('send GraphQL Upload request', async () => {
	interface UploadFile {
		uploadFile: boolean
	}

	interface UploadFileVariables {
		file: File
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

	const client = new AwesomeGraphQLClient({ endpoint: server.endpoint })

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

it('sends additional headers', async () => {
	interface GetUsers {
		users: { id: number; login: string }[]
	}

	let headers: IncomingHttpHeaders = {}

	server = await createServer(
		`
			type Query {
				hello: String!
			}
		`,
		{
			Query: {
				hello(source, args, { reply }) {
					;({ headers } = reply.request)
					return 'world!'
				},
			},
		},
	)

	const query = gql`
		query Hello {
			hello
		}
	`

	const client = new AwesomeGraphQLClient<string, RequestInit>({
		endpoint: server.endpoint,
		fetchOptions: { headers: { 'X-Secret': 'secret' } },
	})

	await client.request<GetUsers>(query)

	expect(headers['x-secret']).toBe('secret')

	client.setFetchOptions({ headers: { 'X-Secret': 'secret-2' } })

	await client.request<GetUsers>(query)

	expect(headers['x-secret']).toBe('secret-2')

	await client.request<GetUsers>(query, {}, { headers: { 'X-Secret': 'secret-3' } })

	expect(headers['x-secret']).toBe('secret-3')

	await client.request<GetUsers>(query, {}, { headers: [['x-secret', 'secret-3']] })

	expect(headers['x-secret']).toBe('secret-3')

	expect(client.getFetchOptions()).toEqual({
		headers: { 'X-Secret': 'secret-2' },
	})
})

it('requestSafe returns data and response on success', async () => {
	interface GetUsers {
		users: { id: number; login: string }[]
	}

	const users = [{ id: 10, login: 'admin' }]

	server = await createServer(
		`
			type Query {
				users: [User!]!
			}
			type User {
				id: Int!
				login: String!
			}
		`,
		{
			Query: {
				users: () => users,
			},
		},
	)

	const client = new AwesomeGraphQLClient({ endpoint: server.endpoint })

	const getUsersResult = await client.requestSafe<GetUsers>(gql`
		query GetUsers {
			users {
				id
				login
			}
		}
	`)

	expect(getUsersResult).toEqual({
		ok: true,
		data: { users },
		response: expect.any(Response),
	})
})

it('requestSafe returns error on fail', async () => {
	interface GetUsers {
		users: { id: number; login: string }[]
	}

	server = await createServer(
		`
		type Query {
			hello: String!
		}
	`,
		{},
	)

	const client = new AwesomeGraphQLClient({ endpoint: server.endpoint })

	const getUsersResult = await client.requestSafe<GetUsers>(gql`
		query GetUsers {
			users {
				id
				login
			}
		}
	`)

	expect(getUsersResult).toEqual({ ok: false, error: expect.any(GraphQLRequestError) })

	const { error } = getUsersResult as {
		ok: false
		error: Error | GraphQLRequestError<Response>
	}

	expect(error.message).toBe(
		'GraphQL Request Error: Cannot query field "users" on type "Query".',
	)
	expect(Object.keys(error)).toEqual(['query', 'variables', 'extensions'])
	expect((error as GraphQLRequestError).response.status).toBe(400)
})

it('throw an error in no endpoint provided', () => {
	// @ts-expect-error it's okay
	expect(() => new AwesomeGraphQLClient({})).toThrow('endpoint is required')
})

it('throws an error if response is not OK', async () => {
	server = await createServer(
		`
		type Query {
			hello: String!
		}
	`,
		{},
	)

	const client = new AwesomeGraphQLClient({
		endpoint: new URL('404', server.endpoint).toString(),
	})

	const query = gql`
		query GetUser($id: Int!) {
			user(id: $id) {
				id
				login
			}
		}
	`

	await expect(client.request(query, { id: 10 })).rejects.toThrow(
		'GraphQL Request Error: Http Status 404',
	)
})

it('throws an error if response is not OK and has errors', async () => {
	server = await createServer(
		`
		type Query {
			hello: String!
		}
	`,
		{
			Query: {
				hello() {
					const err = new Error('Not Authorized')
					// https://mercurius.dev/#/docs/http?id=single-error-with-statuscode-property
					;(err as any).statusCode = 403
					throw err
				},
			},
		},
	)

	const client = new AwesomeGraphQLClient({ endpoint: server.endpoint })

	const query = gql`
		query Hello {
			hello
		}
	`

	await expect(client.request(query)).rejects.toThrow(
		'GraphQL Request Error: Not Authorized',
	)
})

it('throws an error if response is OK but has errors', async () => {
	server = await createServer(
		`
		type Query {
			hello: String!
		}
	`,
		{
			Query: {
				hello() {
					throw new Error('Not Authorized')
				},
			},
		},
		{
			errorFormatter(err, ctx) {
				const response = mercurius.defaultErrorFormatter(err, ctx)
				response.statusCode = 200
				return response
			},
		},
	)

	const client = new AwesomeGraphQLClient({ endpoint: server.endpoint })

	const query = gql`
		query Hello {
			hello
		}
	`

	await expect(client.request(query)).rejects.toThrow(
		'GraphQL Request Error: Not Authorized',
	)
})

it('calls onError hook if provided', async () => {
	server = await createServer(
		`
		type Query {
			hello: String!
		}
	`,
		{
			Query: {
				hello() {
					throw new Error('Not Authorized')
				},
			},
		},
	)

	const onError = jest.fn()

	const client = new AwesomeGraphQLClient({ endpoint: server.endpoint, onError })

	const query = gql`
		query Hello {
			hello
		}
	`

	await expect(client.request(query)).rejects.toThrow(
		'GraphQL Request Error: Not Authorized',
	)

	expect(onError).toHaveBeenCalledWith(expect.any(GraphQLRequestError))
	expect(onError).toHaveBeenCalledTimes(1)
})

it('ignores errors thrown inside onError hook', async () => {
	server = await createServer(
		`
		type Query {
			hello: String!
		}
	`,
		{
			Query: {
				hello() {
					throw new Error('Not Authorized')
				},
			},
		},
	)

	const onError = jest.fn().mockImplementation(() => {
		throw new Error('💣')
	})

	const client = new AwesomeGraphQLClient({ endpoint: server.endpoint, onError })

	const query = gql`
		query Hello {
			hello
		}
	`

	await expect(client.request(query)).rejects.toThrow(
		'GraphQL Request Error: Not Authorized',
	)
})

it('uses provided `isFileUpload` implementation', async () => {
	const query = gql`
		mutation UploadFile($file: Upload!) {
			uploadFile(file: $file)
		}
	`

	class MyFile extends File {}

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
					const data = await streamToString(createReadStream())
					expect(data).toBe('test')

					return true
				},
			},
		},
	)

	const client = new AwesomeGraphQLClient({
		endpoint: server.endpoint,
		isFileUpload: value => value instanceof MyFile,
	})

	const data = await client.request(query, {
		file: new MyFile(['test'], 'text.txt'),
	})

	expect(data).toEqual({ uploadFile: true })
})
