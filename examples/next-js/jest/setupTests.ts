import '@testing-library/jest-dom/extend-expect'

import { server } from './testServer'

beforeAll(() =>
	server.listen({
		onUnhandledRequest: 'error',
	}),
)

afterEach(() => server.resetHandlers())

afterAll(() => server.close())
