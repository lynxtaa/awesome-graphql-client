import {
	QueryClient,
	QueryClientProvider,
	HydrationBoundary,
} from '@tanstack/react-query'
import { type AppProps } from 'next/app'
import { StrictMode } from 'react'

// https://react-query.tanstack.com/guides/ssr

const queryClient = new QueryClient()

export default function MyApp({ Component, pageProps }: AppProps) {
	return (
		<StrictMode>
			<QueryClientProvider client={queryClient}>
				<HydrationBoundary state={pageProps.dehydratedState}>
					<Component {...pageProps} />
				</HydrationBoundary>
			</QueryClientProvider>
		</StrictMode>
	)
}
