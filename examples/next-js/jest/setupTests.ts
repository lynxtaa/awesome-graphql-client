import '@testing-library/jest-dom'

import { server } from './testServer'

beforeAll(() =>
	server.listen({
		onUnhandledRequest: 'error',
	}),
)

afterEach(() => server.resetHandlers())

afterAll(() => server.close())
