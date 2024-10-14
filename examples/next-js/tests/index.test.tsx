import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'

import { server, graphql } from '../jest/testServer'
import {
	type GetCharactersQuery,
	type GetCharactersQueryVariables,
} from '../lib/graphql-queries'
import Home from '../pages/index'

const withProvider = ({ children }: { children?: React.ReactNode }) => (
	<QueryClientProvider client={new QueryClient()}>{children}</QueryClientProvider>
)

it('renders and filters list', async () => {
	server.use(
		graphql.query<GetCharactersQuery, GetCharactersQueryVariables>(
			'GetCharacters',
			async (req, res, ctx) =>
				res(
					ctx.data({
						characters: {
							results: [
								{ id: '1', name: 'Rick Sanchez' },
								{ id: '2', name: 'Jerry Smith' },
								{ id: '3', name: 'Summer Smith' },
								{ id: '4', name: 'Birdperson' },
							]
								.filter(character => character.name.includes(req.variables.name ?? ''))
								.slice(0, 3),
						},
					}),
				),
		),
	)

	render(<Home />, { wrapper: withProvider })

	await screen.findByText('Rick Sanchez')

	await userEvent.type(screen.getByRole('textbox', { name: /Enter name/ }), 'Bird')

	expect(await screen.findByText('Birdperson')).toBeInTheDocument()
	expect(screen.getAllByRole('listitem')).toHaveLength(1)
})
