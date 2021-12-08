/**
 * @jest-environment jsdom
 */

import { TypedDocumentNode } from '@graphql-typed-document-node/core'
import { print, DocumentNode } from 'graphql'
import graphqlTag from 'graphql-tag'

import { AwesomeGraphQLClient, GraphQLRequestError } from '../src/index'
import { gql } from '../src/util/gql'

import { server, graphql, rest } from './jest/server'

if (typeof fetch === 'undefined') {
	require('whatwg-fetch')
}

it('sends GraphQL request without variables', async () => {
	interface GetUsers {
		users: { id: number; login: string }[]
	}

	const users = { users: [{ id: 10, login: 'admin' }] }

	server.use(graphql.query<GetUsers>('GetUsers', (req, res, ctx) => res(ctx.data(users))))

	const client = new AwesomeGraphQLClient({ endpoint: '/api/graphql' })

	expect(client.getEndpoint()).toBe('/api/graphql')

	const query = `
		query GetUsers {
			users {
				id
				login
			}
		}
	`

	const data = await client.request<GetUsers>(query)

	expect(data).toEqual(users)
})

it('sends GraphQL request with variables', async () => {
	interface GetUser {
		user: { id: number; login: string } | null
	}

	interface GetUserVariables {
		id: number
	}

	const users = [{ id: 10, login: 'admin' }]

	server.use(
		graphql.query<GetUser, GetUserVariables>('GetUser', (req, res, ctx) => {
			const user = users.find(user => user.id === req.variables.id) || null
			return res(ctx.data({ user }))
		}),
	)

	const client = new AwesomeGraphQLClient({ endpoint: '/api/graphql' })

	const query = gql`
		query GetUser {
			user {
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

	const users = { users: [{ id: 10, login: 'admin' }] }

	server.use(graphql.query<GetUsers>('GetUsers', (req, res, ctx) => res(ctx.data(users))))

	const client = new AwesomeGraphQLClient({
		endpoint: '/api/graphql',
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

	expect(data).toEqual(users)
})

it('supports TypedDocumentNode', async () => {
	type GetUserQuery = {
		user: { id: number; login: string } | null
	}

	type GetUserQueryVariables = { id: number }

	const user = { user: { id: 10, login: 'admin' } }

	server.use(
		graphql.query<GetUserQuery>('GetUser', (req, res, ctx) => res(ctx.data(user))),
	)

	const client = new AwesomeGraphQLClient({
		endpoint: '/api/graphql',
		formatQuery: (query: TypedDocumentNode) => print(query),
	})

	const GetUserDocument: TypedDocumentNode<
		GetUserQuery,
		GetUserQueryVariables
	> = graphqlTag`
		query GetUser($id: Int!) {
			user(id: $id) {
				id
				login
			}
		}
	`

	const data = await client.request(GetUserDocument, { id: 123 })

	expect(data).toEqual(user)
})

it('sends GraphQL GET request without variables', async () => {
	interface GetUsers {
		users: { id: number; login: string }[]
	}

	const users = { users: [{ id: 10, login: 'admin' }] }

	server.use(graphql.query<GetUsers>('GetUsers', (req, res, ctx) => res(ctx.data(users))))

	const client = new AwesomeGraphQLClient({
		endpoint: 'http://localhost/graphql',
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

	expect(data).toEqual(users)
})

it('sends GraphQL GET request with variables', async () => {
	interface GetUser {
		user: { id: number; login: string } | null
	}

	interface GetUserVariables {
		id: number
	}

	const users = [{ id: 10, login: 'admin' }]

	server.use(
		graphql.query<GetUser, GetUserVariables>('GetUser', (req, res, ctx) => {
			const user = users.find(user => user.id === req.variables.id) || null
			return res(ctx.data({ user }))
		}),
	)

	const client = new AwesomeGraphQLClient({ endpoint: '/api/graphql' })

	const query = gql`
		query GetUser {
			user {
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

	server.use(
		rest.post('/api/graphql', (req, res, ctx) => {
			const form = req.body as FormData

			const operations = form.get('operations')
			const map = form.get('map')
			const file = form.get('1')

			if (typeof operations !== 'string' || typeof map !== 'string') {
				return res(ctx.status(400))
			}

			expect(JSON.parse(operations)).toEqual({
				query: expect.stringContaining('UploadFile'),
				variables: {
					file: null,
				},
			})

			expect(JSON.parse(map)).toEqual({ 1: ['variables.file'] })

			expect(file).toBeInstanceOf(File)

			return res(ctx.json({ data: { uploadFile: true } }))
		}),
	)

	const client = new AwesomeGraphQLClient({ endpoint: '/api/graphql' })

	const query = gql`
		mutation UploadFile($file: Upload!) {
			uploadFile(file: $file)
		}
	`

	const data = await client.request<UploadFile, UploadFileVariables>(query, {
		file: new File([''], 'image.png'),
	})

	expect(data).toEqual({ uploadFile: true })
})

it('sends additional headers', async () => {
	interface GetUsers {
		users: { id: number; login: string }[]
	}

	const users = { users: [{ id: 10, login: 'admin' }] }

	let headers: Headers = new Headers()

	server.use(
		graphql.query<GetUsers>('GetUsers', (req, res, ctx) => {
			headers = req.headers

			return res(ctx.data(users))
		}),
	)

	const query = gql`
		query GetUsers {
			users {
				id
				login
			}
		}
	`

	const client = new AwesomeGraphQLClient({
		endpoint: '/api/graphql',
		fetchOptions: { headers: { 'X-Secret': 'secret' } },
	})

	await client.request<GetUsers>(query)

	expect(headers.get('X-Secret')).toBe('secret')

	client.setFetchOptions({ headers: { 'X-Secret': 'secret-2' } })

	await client.request<GetUsers>(query)

	expect(headers.get('X-Secret')).toBe('secret-2')

	await client.request<GetUsers>(query, {}, { headers: { 'X-Secret': 'secret-3' } })

	expect(headers.get('X-Secret')).toBe('secret-3')

	expect(client.getFetchOptions()).toEqual({
		headers: { 'X-Secret': 'secret-2' },
	})
})

it('requestSafe returns data and response on success', async () => {
	interface GetUsers {
		users: { id: number; login: string }[]
	}
	interface UpdateUser {
		user: { id: number }
	}

	const users = { users: [{ id: 10, login: 'admin' }] }

	server.use(
		graphql.query<GetUsers>('GetUsers', (req, res, ctx) => res(ctx.data(users))),

		graphql.mutation<UpdateUser>('UpdateUser', (req, res, ctx) =>
			res(ctx.errors([{ message: 'Forbidden' }])),
		),
	)

	const client = new AwesomeGraphQLClient({ endpoint: '/api/graphql' })

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
		data: users,
		response: expect.any(Response),
	})
})

it('requestSafe returns error on fail', async () => {
	interface GetUsers {
		users: { id: number; login: string }[]
	}

	server.use(
		graphql.query<GetUsers>('GetUsers', (req, res, ctx) =>
			res(ctx.errors([{ message: 'Forbidden' }])),
		),
	)

	const client = new AwesomeGraphQLClient({ endpoint: '/api/graphql' })

	const getUsersResult = await client.requestSafe<GetUsers>(gql`
		query GetUsers {
			users {
				id
				login
			}
		}
	`)

	expect(getUsersResult).toEqual({ ok: false, error: expect.any(GraphQLRequestError) })

	if (!getUsersResult.ok) {
		expect(getUsersResult.error.message).toBe('GraphQL Request Error: Forbidden')
	}
})

it('throw an error in no endpoint provided', () => {
	expect(() => new AwesomeGraphQLClient({} as any)).toThrow('endpoint is required')
})

it('throws an error if response is not OK', async () => {
	server.use(rest.post('*', (req, res, ctx) => res(ctx.status(404))))

	const client = new AwesomeGraphQLClient({ endpoint: '/api/graphql' })

	const query = gql`
		query GetUsers {
			users {
				id
				login
			}
		}
	`

	await expect(client.request(query)).rejects.toThrow(
		'GraphQL Request Error: Http Status 404',
	)
})

it('throws an error if response is not OK and has errors', async () => {
	server.use(
		graphql.query('GetUsers', (req, res, ctx) =>
			res(ctx.status(403), ctx.errors([{ message: 'Not Authorized' }])),
		),
	)

	const client = new AwesomeGraphQLClient({ endpoint: '/api/graphql' })

	const query = gql`
		query GetUsers {
			users {
				id
				login
			}
		}
	`

	await expect(client.request(query)).rejects.toThrow(
		'GraphQL Request Error: Not Authorized',
	)
})

it('throws an error if response is OK but has errors', async () => {
	server.use(
		graphql.query('GetUsers', (req, res, ctx) =>
			res(ctx.errors([{ message: 'Not Authorized' }])),
		),
	)

	const client = new AwesomeGraphQLClient({ endpoint: '/api/graphql' })

	const query = gql`
		query GetUsers {
			users {
				id
				login
			}
		}
	`

	await expect(client.request(query)).rejects.toThrow(
		'GraphQL Request Error: Not Authorized',
	)
})

it('calls onError hook if provided', async () => {
	server.use(
		graphql.query('GetUsers', (req, res, ctx) =>
			res(ctx.errors([{ message: 'Not Authorized' }])),
		),
	)

	const onError = jest.fn()

	const client = new AwesomeGraphQLClient({ endpoint: '/api/graphql', onError })

	const query = gql`
		query GetUsers {
			users {
				id
				login
			}
		}
	`

	await expect(client.request(query)).rejects.toThrow(
		'GraphQL Request Error: Not Authorized',
	)

	expect(onError).toHaveBeenCalledWith(expect.any(GraphQLRequestError))
	expect(onError).toHaveBeenCalledTimes(1)
})

it('ignores errors thrown inside onError hook', async () => {
	server.use(
		graphql.query('GetUsers', (req, res, ctx) =>
			res(ctx.errors([{ message: 'Not Authorized' }])),
		),
	)

	const onError = jest.fn().mockImplementation(() => {
		throw new Error('💣')
	})

	const client = new AwesomeGraphQLClient({ endpoint: '/api/graphql', onError })

	const query = gql`
		query GetUsers {
			users {
				id
				login
			}
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

	class MyFile {
		filename: string
		constructor(filename: string) {
			this.filename = filename
		}
		toString() {
			return this.filename
		}
	}

	server.use(
		rest.post('/api/graphql', (req, res, ctx) => {
			const form = req.body as FormData

			const operations = form.get('operations')
			const map = form.get('map')

			if (typeof operations !== 'string' || typeof map !== 'string') {
				return res(ctx.status(400))
			}

			expect(JSON.parse(operations)).toEqual({
				query,
				variables: { file: null },
			})

			expect(JSON.parse(map)).toEqual({ 1: ['variables.file'] })
			expect(form.get('1')).toBe('image.png')

			return res(ctx.json({ data: { uploadFile: true } }))
		}),
	)

	const client = new AwesomeGraphQLClient({
		endpoint: '/api/graphql',
		isFileUpload: (value): value is MyFile => value instanceof MyFile,
	})

	const data = await client.request(query, {
		file: new MyFile('image.png'),
	})

	expect(data).toEqual({ uploadFile: true })
})
