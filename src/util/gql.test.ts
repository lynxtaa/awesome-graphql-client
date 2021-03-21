import { gql } from './gql'

it('formats query with values as a string', () => {
	const userId = 123

	const query = gql`
		query getUser {
			user(id: ${userId}) {
				id
				login
			}
		}
	`

	expect(query).toBe(`query getUser {
			user(id: 123) {
				id
				login
			}
		}`)
})

it('formats query without values as a string', () => {
	const query = gql`
		query getUsers {
			users {
				id
				login
			}
		}
	`

	expect(query).toBe(`query getUsers {
			users {
				id
				login
			}
		}`)
})
