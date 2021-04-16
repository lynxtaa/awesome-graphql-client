import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from 'react-query'

import { server, graphql } from '../jest/testServer'
import { GetCharactersQuery, GetCharactersQueryVariables } from '../lib/graphql-queries'
import Home from '../pages/index'

const withProvider = ({ children }: { children?: React.ReactNode }) => (
	<QueryClientProvider client={new QueryClient()}>{children}</QueryClientProvider>
)

it('renders and filters list', async () => {
	server.use(
		graphql.query<GetCharactersQuery, GetCharactersQueryVariables>(
			'GetCharactersQuery',
			(req, res, ctx) =>
				res(
					ctx.data({
						characters: {
							results: [
								{ id: '1', name: 'Rick Sanchez' },
								{ id: '2', name: 'Jerry Smith' },
								{ id: '3', name: 'Summer Smith' },
								{ id: '4', name: 'Birdperson' },
							]
								.filter((character) => character.name.includes(req.variables.name || ''))
								.slice(0, 3),
						},
					}),
				),
		),
	)

	render(<Home />, { wrapper: withProvider })

	await screen.findByText('Rick Sanchez')

	userEvent.type(screen.getByRole('textbox', { name: /Enter name/ }), 'Bird')

	expect(await screen.findByText('Birdperson')).toBeInTheDocument()
	expect(screen.getAllByRole('listitem')).toHaveLength(1)
})
