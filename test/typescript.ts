/**
 * @jest-environment node
 */

import fetch from 'node-fetch'

import { AwesomeGraphQLClient } from '../src/index'
import { gql } from '../src/util/gql'

const client = new AwesomeGraphQLClient({
	endpoint: 'http://localhost:1234/api/graphql',
	fetch,
})

export async function withVariables(): Promise<void> {
	type GetUserQuery = { user: { id: 1 } }
	type GetUserQueryVariables = { id: number }

	const query = gql`
		query GetUser($id: Int!) {
			user(id: $id) {
				id
			}
		}
	`

	const data = await client.request<GetUserQuery, GetUserQueryVariables>(query, { id: 1 })

	console.log(data.user.id)

	// TODO:
	// this should fail typechecking because no variables provided,
	// but I'm not sure how to type it correctly
	client.request<GetUserQuery, GetUserQueryVariables>(query)

	const result = await client.requestSafe<GetUserQuery, GetUserQueryVariables>(query, {
		id: 1,
	})

	if (!result.ok) {
		console.log(result.error.message)
	} else {
		console.log(result.data.user.id)
		console.log(result.response.status)
	}
}

export async function withOptionalVariables(): Promise<void> {
	type GetUsersQuery = { users: { id: 1 }[] }
	type GetUsersQueryVariables = { login?: string }

	const query = gql`
		query GetUsers {
			users {
				id
			}
		}
	`

	const data = await client.request<GetUsersQuery>(query)

	await client.request<GetUsersQuery, GetUsersQueryVariables>(query)
	await client.request<GetUsersQuery, GetUsersQueryVariables>(query, {})

	console.log(data.users)

	client.request<GetUsersQuery>(query, {})
	client.request<GetUsersQuery>(query, undefined)

	// @ts-expect-error wrong variables
	client.request<GetUsersQuery>(query, { id: 123 })

	const result = await client.requestSafe<GetUsersQuery>(query)

	if (!result.ok) {
		console.log(result.error.message)
	} else {
		console.log(result.data.users)
		console.log(result.response.status)
	}
}

export async function withoutVariables(): Promise<void> {
	type GetUsersQuery = { users: { id: 1 }[] }
	type GetUsersQueryVariables = Record<string, never>

	const query = gql`
		query GetUsers {
			users {
				id
			}
		}
	`

	const data = await client.request<GetUsersQuery>(query)

	await client.request<GetUsersQuery, GetUsersQueryVariables>(query)
	await client.request<GetUsersQuery, GetUsersQueryVariables>(query, {})

	console.log(data.users)

	client.request<GetUsersQuery>(query, {})
	client.request<GetUsersQuery>(query, undefined)

	// @ts-expect-error wrong variables
	client.request<GetUsersQuery>(query, { id: 123 })

	const result = await client.requestSafe<GetUsersQuery>(query)

	if (!result.ok) {
		console.log(result.error.message)
	} else {
		console.log(result.data.users)
		console.log(result.response.status)
	}
}
