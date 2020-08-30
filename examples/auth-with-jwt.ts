/**
 * Example of using access and refresh tokens flow
 * Storing access-token in memory and refresh-token in httpOnly cookie
 */

import { AwesomeGraphQLClient, gql } from 'awesome-graphql-client'

type FetchOptions = RequestInit & { skipRefresh?: boolean }

class AuthContainer {
	client: AwesomeGraphQLClient<string, FetchOptions>

	accessToken: string
	tokenType: string
	expiresAt: number

	private resolvers: [() => void, (error: Error) => void][]

	constructor({
		endpoint,
		accessToken = '',
		tokenType = '',
		expiresAt = 0,
	}: {
		accessToken?: string
		tokenType?: string
		expiresAt?: number
		endpoint: string
	}) {
		this.accessToken = accessToken
		this.tokenType = tokenType
		this.expiresAt = expiresAt
		this.resolvers = []

		this.client = new AwesomeGraphQLClient<string, FetchOptions>({
			endpoint,
			fetch: async (url: string, { skipRefresh, ...options }: FetchOptions = {}) => {
				if (this.isExpired() && !skipRefresh) {
					await this.refresh()
				}

				return fetch(url, {
					...options,
					credentials: 'include',
					headers: { ...options.headers, ...this.getHeaders() },
				})
			},
		})
	}

	isLogged() {
		return Boolean(this.accessToken)
	}

	isExpired() {
		return this.isLogged() && this.expiresAt - Date.now() < 100
	}

	getHeaders() {
		return this.isLogged()
			? { Authorization: `${this.tokenType} ${this.accessToken}` }
			: undefined
	}

	/**
	 * If token expires and there are multiple parallel requests,
	 * we should refresh it only once.
	 * First refresh call does the actual request,
	 * others are waiting for it to be resolved
	 */
	refresh() {
		/**
		 * refresh mutation sets refresh-token in httpOnly cookie
		 * and returns access-token
		 */
		const Refresh = gql`
			mutation Refresh {
				refresh {
					accessToken
					tokenType
					expiresIn
				}
			}
		`

		type RefreshType = {
			refresh: {
				accessToken: string
				tokenType: string
				expiresIn: number
			}
		}

		return new Promise<void>(async (resolve, reject) => {
			this.resolvers.push([resolve, reject])

			// First refresh call
			if (this.resolvers.length === 0) {
				try {
					const data = await this.client.request<RefreshType>(
						Refresh,
						{},
						{ skipRefresh: true }, // preventing infinite refresh loop
					)

					this.accessToken = data.refresh.accessToken
					this.tokenType = data.refresh.tokenType
					this.expiresAt = Date.now() + data.refresh.expiresIn * 1000

					this.resolvers.forEach(([resolve]) => resolve())
				} catch (error) {
					this.resolvers.forEach(([, reject]) => reject(error))
				} finally {
					this.resolvers = []
				}
			}
		})
	}
}

const authContainer = new AuthContainer({ endpoint: 'http://localhost/graphql' })

const { client } = authContainer

export { authContainer, client }
