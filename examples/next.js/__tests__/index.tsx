import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { GetCharacters, GetCharactersVariables } from '../lib/gql-queries'
import { server, graphql } from '../jest/testServer'

import Home from '../pages/index'

it('renders and filters list', async () => {
	server.use(
		graphql.query<GetCharacters, GetCharactersVariables>(
			'GetCharacters',
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

	render(<Home initialData={{ characters: { results: [] } }} />)

	await screen.findByText('Rick Sanchez')

	userEvent.type(screen.getByRole('textbox', { name: /Enter name/ }), 'Bird')

	expect(await screen.findByText('Birdperson')).toBeInTheDocument()
	expect(screen.getAllByRole('listitem')).toHaveLength(1)
})
