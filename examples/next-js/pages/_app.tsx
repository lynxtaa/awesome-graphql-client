import { QueryClient, QueryClientProvider, Hydrate } from '@tanstack/react-query'
import { AppProps } from 'next/app'
import { StrictMode } from 'react'

// https://react-query.tanstack.com/guides/ssr

const queryClient = new QueryClient()

export default function MyApp({ Component, pageProps }: AppProps) {
	return (
		<StrictMode>
			<QueryClientProvider client={queryClient}>
				<Hydrate state={pageProps.dehydratedState}>
					<Component {...pageProps} />
				</Hydrate>
			</QueryClientProvider>
		</StrictMode>
	)
}
