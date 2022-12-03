import { QueryClient, dehydrate } from '@tanstack/react-query'
import { GetStaticProps } from 'next'
import { useState } from 'react'

import { graphQLClient } from '../lib/graphQLClient'
import { GetCharactersDocument, useGetCharactersQuery } from '../lib/graphql-queries'

export default function Home() {
	const [filter, setFilter] = useState('')

	const { data, error } = useGetCharactersQuery(
		{ name: filter },
		{ staleTime: 60 * 1000, keepPreviousData: true },
	)

	return (
		<div>
			<label htmlFor="filter">Enter name: </label>
			<input
				value={filter}
				id="filter"
				name="filter"
				onChange={event => setFilter(event.target.value)}
			/>
			{data ? (
				<ul>
					{data.characters!.results!.map((character, i) => (
						<li key={character!.id ?? i}>{character!.name}</li>
					))}
				</ul>
			) : error ? (
				<div>Error: {error.message}</div>
			) : (
				<div>Loading...</div>
			)}
		</div>
	)
}

export const getStaticProps: GetStaticProps = async () => {
	const queryClient = new QueryClient()

	await queryClient.prefetchQuery(useGetCharactersQuery.getKey({ name: '' }), () =>
		graphQLClient.request(GetCharactersDocument, { name: '' }),
	)

	return {
		props: { dehydratedState: dehydrate(queryClient) },
		revalidate: 6 * 60 * 60, // every 6 hours
	}
}
